// WBS 4.1.1–4.2.3 — Reports and Analytics Calculations
// Assigned Member(s): Jhewell Latag
// NOTE: Shared modules are labeled with all applicable WBS responsibilities.
// services/reportService.js - monthly reports, batch reports, at analytics (4.1, 4.2)
const model = require('../models/reportServiceModel');
const { batchProfit, monthlyReport } = require('./profitService');

const num = (v) => Number(v || 0);

// Monthly report ng Gulayan / Prutasan
async function monthlyFull(dept, month) {
  const base = await monthlyReport(dept, month);
  const [[mv]] = await model.getMonthlyStockMovement([dept, `${month}%`]);
  const [cats] = await model.getMonthlyExpensesByCategory([dept, `${month}%`]);
  return { ...base, stockIn: num(mv.stockIn), stockOut: num(mv.stockOut), spoiled: num(mv.spoiled), expenseByCategory: cats };
}

// Per-batch report ng Babuyan: profit + health + nagamit na feeds/medicine
async function batchReport(id) {
  const profit = await batchProfit(id);
  if (!profit) return null;
  const [[w]] = await model.getLatestBatchWeight([id]);
  const [[m]] = await model.getBatchMortalityTotal([id]);
  const [[v]] = await model.getBatchVaccinationCount([id]);
  const [usage] = await model.getBatchUsageSummary([id]);
  return { ...profit, latestWeight: w ? num(w.value) : 0, mortality: num(m.dead), vaccinations: v.n, usage };
}

// Analytics ng Gulayan / Prutasan
async function deptAnalytics(dept) {
  const [best] = await model.getTopSellingProducts([dept]);
  // underperforming = pinakakaunting benta (kasama ang walang benta)
  const [under] = await model.getSlowMovingProducts([dept]);
  const [peak] = await model.getSalesByWeekday([dept]);
  const [spoil] = await model.getMonthlySpoilageTrend([dept]);
  const [share] = await model.getExpenseBreakdown([dept]);
  return { best, under, peak, spoil, share };
}

// Analytics ng Babuyan: comparison ng batches
async function babuyanAnalytics() {
  const [batches] = await model.listBatchIds();
  const rows = [];
  for (const b of batches) {
    const p = await batchProfit(b.id);
    if (!p) continue;
    // feed = items na "sack" ang unit
    const [[f]] = await model.getBatchFeedUsage([b.id]);
    rows.push({
      label: `Batch #${b.id}`,
      costPerKilo: p.costPerKilo,
      netProfit: p.netProfit,
      totalCost: p.totalCost,
      feedSacks: num(f.feed),
      feedToWeight: p.kilosSold > 0 ? num(f.feed) / p.kilosSold : 0, // sacks kada kilo ng live weight
    });
  }
  return { batches: rows };
}

// 1.1.5 Sales summary: Gulayan/Prutasan kada product sa isang buwan, Babuyan kada batch
async function salesSummary(dept, month) {
  if (dept === 'babuyan') {
    const [rows] = await model.getBatchSalesTotals();
    return { rows: rows.map((r) => ({ batch_id: r.batch_id, kilos: num(r.kilos), income: num(r.income) })) };
  }
  const [rows] = await model.getMonthlyProductSales([dept, `${month}%`]);
  return { rows: rows.map((r) => ({ product: r.product, transactions: r.transactions, kilos: num(r.kilos), total: num(r.total), cogs: num(r.cogs) })) };
}

// 2.2.4 Expense summary: per category sa isang buwan, at per batch para sa Babuyan
async function expenseSummary(dept, month) {
  const [byCategory] = await model.getMonthlyExpenseBreakdown([dept, `${month}%`]);
  let byBatch = [];
  if (dept === 'babuyan') {
    [byBatch] = await model.getBatchExpenseTotals();
  }
  return {
    byCategory: byCategory.map((r) => ({ category: r.category, total: num(r.total) })),
    byBatch: byBatch.map((r) => ({ batch_id: r.batch_id, category: r.category, total: num(r.total) })),
  };
}

module.exports = { monthlyFull, batchReport, deptAnalytics, babuyanAnalytics, salesSummary, expenseSummary };
