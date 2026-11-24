const db = require('../config/db');

// ==========================================
// 4.6 COMMON DATA-ACCESS & AGGREGATION HELPERS
// ==========================================
const getDepartmentExpenseShare = async (department) => {
  const [expenseCategories] = await db.query(
    `SELECT category, SUM(amount) AS total_amount
     FROM expenses
     WHERE department = ?
     GROUP BY category`,
    [department]
  );

  const totalExpense = expenseCategories.reduce(
    (sum, row) => sum + Number(row.total_amount),
    0
  );

  return expenseCategories.map((row) => ({
    category: row.category,
    total_amount: Number(row.total_amount),
    percentage:
      totalExpense > 0
        ? Number(((Number(row.total_amount) / totalExpense) * 100).toFixed(2))
        : 0,
  }));
};

const getMonthlySpoilageTrends = async (tableName, department) => {
  const [spoilageTrends] = await db.query(
    `SELECT DATE_FORMAT(movement_date, '%Y-%m') AS month,
            SUM(kilos) AS spoiled_kilos,
            SUM(spoilage_loss) AS spoilage_loss
     FROM ${tableName}
     WHERE department = ? AND movement_type = 'OUT_SPOILAGE'
     GROUP BY DATE_FORMAT(movement_date, '%Y-%m')
     ORDER BY month ASC`,
    [department]
  );
  return spoilageTrends;
};

const getMonthlyProfitTrend = async (salesTable, dateCol, amountCol, department) => {
  const [monthlyRevenue] = await db.query(
    `SELECT DATE_FORMAT(${dateCol}, '%Y-%m') AS month, COALESCE(SUM(${amountCol}), 0) AS revenue
     FROM ${salesTable}
     WHERE department = ?
     GROUP BY DATE_FORMAT(${dateCol}, '%Y-%m')`,
    [department]
  );

  const [monthlyExpenses] = await db.query(
    `SELECT DATE_FORMAT(expense_date, '%Y-%m') AS month, COALESCE(SUM(amount), 0) AS expenses
     FROM expenses
     WHERE department = ?
     GROUP BY DATE_FORMAT(expense_date, '%Y-%m')`,
    [department]
  );

  const monthsSet = new Set([
    ...monthlyRevenue.map((r) => r.month),
    ...monthlyExpenses.map((e) => e.month),
  ]);

  return Array.from(monthsSet)
    .sort()
    .map((month) => {
      const rev = Number(monthlyRevenue.find((r) => r.month === month)?.revenue || 0);
      const exp = Number(monthlyExpenses.find((e) => e.month === month)?.expenses || 0);
      return {
        month,
        revenue: rev,
        expenses: exp,
        net_profit: rev - exp,
      };
    });
};

// ==========================================
// 1.10 GULAYAN ANALYTICS
// ==========================================
exports.getGulayanAnalytics = async () => {
  const [bestSelling] = await db.query(
    `SELECT item_name, SUM(kilos) AS total_kilos, SUM(total_amount) AS total_sales
     FROM gulayan_sales
     WHERE department = 'Gulayan'
     GROUP BY item_name
     ORDER BY total_kilos DESC
     LIMIT 5`
  );

  const [peakSalesDays] = await db.query(
    `SELECT DATE(sale_date) AS sale_day, SUM(total_amount) AS daily_sales
     FROM gulayan_sales
     WHERE department = 'Gulayan'
     GROUP BY DATE(sale_date)
     ORDER BY daily_sales DESC
     LIMIT 5`
  );

  const [underperforming] = await db.query(
    `SELECT i.item_name, COALESCE(SUM(s.kilos), 0) AS total_kilos
     FROM inventory i
     LEFT JOIN gulayan_sales s 
       ON i.item_name = s.item_name AND s.department = 'Gulayan'
     WHERE i.department = 'Gulayan'
     GROUP BY i.item_name
     ORDER BY total_kilos ASC
     LIMIT 5`
  );

  const spoilageTrends = await getMonthlySpoilageTrends('gulayan_stock_movements', 'Gulayan');
  const expenseShare = await getDepartmentExpenseShare('Gulayan');

  return {
    bestSelling,
    peakSalesDays,
    underperforming,
    spoilageTrends,
    expenseShare,
  };
};

// ==========================================
// 2.10 PRUTASAN ANALYTICS
// ==========================================
exports.getPrutasanAnalytics = async () => {
  const [bestSelling] = await db.query(
    `SELECT fruit AS item_name, SUM(kilos) AS total_kilos, SUM(total_amount) AS total_sales
     FROM prutasan_sales
     WHERE department = 'Prutasan'
     GROUP BY fruit
     ORDER BY total_kilos DESC
     LIMIT 5`
  );

  const [peakSalesDays] = await db.query(
    `SELECT DATE(sale_date) AS sale_day, SUM(total_amount) AS daily_sales
     FROM prutasan_sales
     WHERE department = 'Prutasan'
     GROUP BY DATE(sale_date)
     ORDER BY daily_sales DESC
     LIMIT 5`
  );

  const [underperforming] = await db.query(
    `SELECT i.item_name, COALESCE(SUM(s.kilos), 0) AS total_kilos
     FROM inventory i
     LEFT JOIN prutasan_sales s 
       ON i.item_name = s.fruit AND s.department = 'Prutasan'
     WHERE i.department = 'Prutasan'
     GROUP BY i.item_name
     ORDER BY total_kilos ASC
     LIMIT 5`
  );

  const spoilageTrends = await getMonthlySpoilageTrends('prutasan_stock_movements', 'Prutasan');
  const expenseShare = await getDepartmentExpenseShare('Prutasan');

  return {
    bestSelling,
    peakSalesDays,
    underperforming,
    spoilageTrends,
    expenseShare,
  };
};

// ==========================================
// 3.8 BABUYAN ANALYTICS
// ==========================================
exports.getBabuyanAnalytics = async () => {
  const [batches] = await db.query(
    `SELECT batch_id, batch_name, purchase_date, number_of_heads, capital_cost, expected_selling_date
     FROM pig_batches
     ORDER BY purchase_date ASC, id ASC`
  );

  const batchMetrics = [];

  for (const batch of batches) {
    const bId = batch.batch_id;
    const capitalCost = Number(batch.capital_cost || 0);
    const activeHeads = Number(batch.number_of_heads || 0);

    const [feedUsageRows] = await db.query(
      `SELECT COALESCE(SUM(u.quantity_released), 0) AS total_feed_units
       FROM babuyan_usage_records u
       JOIN babuyan_inventory i ON u.inventory_id = i.id
       WHERE u.batch_id = ? AND i.category = 'feeds'`,
      [bId]
    );
    const totalFeedUnits = Number(feedUsageRows[0].total_feed_units);

    const [expenseRows] = await db.query(
      `SELECT 
         COALESCE(SUM(CASE WHEN category = 'feed' THEN amount ELSE 0 END), 0) AS feed_cost,
         COALESCE(SUM(CASE WHEN category = 'veterinary care' THEN amount ELSE 0 END), 0) AS medicine_cost,
         COALESCE(SUM(CASE WHEN category NOT IN ('feed', 'veterinary care') THEN amount ELSE 0 END), 0) AS other_expenses
       FROM expenses
       WHERE department = 'Babuyan' AND batch_id = ?`,
      [bId]
    );

    const feedCost = Number(expenseRows[0].feed_cost);
    const medicineCost = Number(expenseRows[0].medicine_cost);
    const otherExpenses = Number(expenseRows[0].other_expenses);
    const totalProductionCost = capitalCost + feedCost + medicineCost + otherExpenses;

    const [salesRows] = await db.query(
      `SELECT 
         COALESCE(SUM(live_weight_kg), 0) AS total_live_weight_sold,
         COALESCE(SUM(total_revenue), 0) AS total_revenue
       FROM babuyan_hog_sales
       WHERE department = 'Babuyan' AND batch_id = ?`,
      [bId]
    );

    const soldWeightKg = Number(salesRows[0].total_live_weight_sold);
    const totalRevenue = Number(salesRows[0].total_revenue);

    let totalLiveWeightKg = soldWeightKg;
    if (totalLiveWeightKg === 0) {
      const [latestWeight] = await db.query(
        `SELECT average_weight_kg
         FROM babuyan_weight_records
         WHERE batch_id = ?
         ORDER BY record_date DESC, id DESC
         LIMIT 1`,
        [bId]
      );
      if (latestWeight.length > 0) {
        totalLiveWeightKg = Number(latestWeight[0].average_weight_kg) * activeHeads;
      }
    }

    const feedToWeightRatio =
      totalLiveWeightKg > 0 ? Number((totalFeedUnits / totalLiveWeightKg).toFixed(2)) : 0;

    const costPerKiloLiveWeight =
      totalLiveWeightKg > 0 ? Number((totalProductionCost / totalLiveWeightKg).toFixed(2)) : 0;

    const netProfit = totalRevenue - totalProductionCost;

    batchMetrics.push({
      batch_id: bId,
      batch_name: batch.batch_name || bId,
      purchase_date: batch.purchase_date,
      expected_selling_date: batch.expected_selling_date,
      active_heads: activeHeads,
      total_feed_units: totalFeedUnits,
      total_live_weight_kg: Number(totalLiveWeightKg.toFixed(2)),
      feed_to_weight_ratio: feedToWeightRatio,
      cost_per_kilo_live_weight: costPerKiloLiveWeight,
      cost_comparison: {
        capital_cost: capitalCost,
        feed_cost: feedCost,
        medicine_cost: medicineCost,
        other_expenses: otherExpenses,
        total_cost: totalProductionCost,
      },
      total_revenue: totalRevenue,
      net_profit: netProfit,
    });
  }

  const profitTrend = await getMonthlyProfitTrend(
    'babuyan_hog_sales',
    'sale_date',
    'total_revenue',
    'Babuyan'
  );

  return {
    batchMetrics,
    profitTrend,
  };
};