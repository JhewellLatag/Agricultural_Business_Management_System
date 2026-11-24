const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const db = require('../config/db');

// Helper: Format SQL Date safely
const formatDate = (val) => {
  if (!val) return '-';
  if (val instanceof Date) return val.toISOString().split('T')[0];
  return String(val).split('T')[0];
};

// ==========================================
// 4.5 SHARED REPORTING DATA AGGREGATOR
// ==========================================
exports.getDepartmentMonthlyAndSummaries = async ({ department = 'Gulayan', month = null } = {}) => {
  if (department === 'Gulayan' || department === 'Prutasan') {
    const salesTable = department === 'Gulayan' ? 'gulayan_sales' : 'prutasan_sales';
    const itemCol = department === 'Gulayan' ? 'item_name' : 'fruit';
    const moveTable =
      department === 'Gulayan' ? 'gulayan_stock_movements' : 'prutasan_stock_movements';

    const dateFilter = month ? AND DATE_FORMAT(sale_date, '%Y-%m') = ? : '';
    const moveDateFilter = month ? AND DATE_FORMAT(movement_date, '%Y-%m') = ? : '';
    const expDateFilter = month ? AND DATE_FORMAT(expense_date, '%Y-%m') = ? : '';
    const params = month ? [month] : [];

    // Sales Summary
    const [salesRows] = await db.query(
      `SELECT id, ${itemCol} AS item_name, kilos, price_per_kilo, total_amount, sale_date
       FROM ${salesTable}
       WHERE department = ? ${dateFilter}
       ORDER BY sale_date DESC, id DESC`,
      [department, ...params]
    );

    const totalSales = salesRows.reduce((sum, r) => sum + Number(r.total_amount || 0), 0);
    const totalKilosSold = salesRows.reduce((sum, r) => sum + Number(r.kilos || 0), 0);

    // Spoilage Loss Summary
    const [spoilageRows] = await db.query(
      `SELECT COALESCE(SUM(spoilage_loss), 0) AS total_spoilage_loss
       FROM ${moveTable}
       WHERE department = ? AND movement_type = 'OUT_SPOILAGE' ${moveDateFilter}`,
      [department, ...params]
    );
    const totalSpoilageLoss = Number(spoilageRows[0]?.total_spoilage_loss || 0);

    // Expense Summary
    const [expenseRows] = await db.query(
      `SELECT id, category, amount, description, expense_date
       FROM expenses
       WHERE department = ? ${expDateFilter}
       ORDER BY expense_date DESC, id DESC`,
      [department, ...params]
    );

    const totalExpenses = expenseRows.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const netProfit = totalSales - totalExpenses - totalSpoilageLoss;

    return {
      reportTitle: ${department} Monthly Report & Sales/Expense Summary,
      period: month || 'All Periods',
      summaryMetrics: {
        total_kilos_sold: totalKilosSold,
        total_sales: totalSales,
        total_expenses: totalExpenses,
        spoilage_loss: totalSpoilageLoss,
        net_profit: netProfit,
      },
      salesRecords: salesRows.map((s) => ({
        ...s,
        sale_date: formatDate(s.sale_date),
      })),
      expenseRecords: expenseRows.map((e) => ({
        ...e,
        expense_date: formatDate(e.expense_date),
      })),
    };
  }

  // Babuyan Per-Batch Report + Sales & Expense Summaries
  const [batches] = await db.query(
    `SELECT batch_id, batch_name, purchase_date, number_of_heads, capital_cost, expected_selling_date
     FROM pig_batches
     ORDER BY purchase_date DESC, id DESC`
  );

  const batchReports = [];
  for (const batch of batches) {
    const bId = batch.batch_id;
    const capitalCost = Number(batch.capital_cost || 0);

    const [expCats] = await db.query(
      `SELECT category, COALESCE(SUM(amount), 0) AS category_total
       FROM expenses
       WHERE department = 'Babuyan' AND batch_id = ?
       GROUP BY category`,
      [bId]
    );

    const feedCost = Number(expCats.find((e) => e.category === 'feed')?.category_total || 0);
    const medicineCost = Number(
      expCats.find((e) => e.category === 'veterinary care')?.category_total || 0
    );
    const otherExpenses = expCats
      .filter((e) => !['feed', 'veterinary care'].includes(e.category))
      .reduce((sum, e) => sum + Number(e.category_total || 0), 0);

    const totalExpenses = feedCost + medicineCost + otherExpenses;
    const totalCost = capitalCost + totalExpenses;

    const [salesRows] = await db.query(
      `SELECT COALESCE(SUM(live_weight_kg), 0) AS total_weight, COALESCE(SUM(total_revenue), 0) AS total_income
       FROM babuyan_hog_sales
       WHERE department = 'Babuyan' AND batch_id = ?`,
      [bId]
    );

    const liveWeightSoldKg = Number(salesRows[0]?.total_weight || 0);
    const income = Number(salesRows[0]?.total_income || 0);
    const netProfit = income - totalCost;

    batchReports.push({
      batch_id: bId,
      batch_name: batch.batch_name || '-',
      purchase_date: formatDate(batch.purchase_date),
      expected_selling_date: formatDate(batch.expected_selling_date),
      active_heads: Number(batch.number_of_heads || 0),
      financial_summary: {
        capital: capitalCost,
        feed: feedCost,
        medicine: medicineCost,
        other_expenses: otherExpenses,
        total_expenses: totalExpenses,
        total_cost: totalCost,
        live_weight_sold_kg: liveWeightSoldKg,
        income,
        net_profit: netProfit,
      },
    });
  }

  const totalSales = batchReports.reduce((sum, b) => sum + b.financial_summary.income, 0);
  const totalExpenses = batchReports.reduce((sum, b) => sum + b.financial_summary.total_expenses, 0);
  const totalNetProfit = batchReports.reduce((sum, b) => sum + b.financial_summary.net_profit, 0);

  return {
    reportTitle: 'Babuyan Per-Batch Report & Sales/Expense Summary',
    period: month || 'All Batches',
    summaryMetrics: {
      total_sales: totalSales,
      total_expenses: totalExpenses,
      net_profit: totalNetProfit,
    },
    batchReports,
  };
};

// ==========================================
// 4.5 SHARED PDF GENERATION ENGINE
// ==========================================
exports.generateSharedPDF = (res, reportPayload) => {
  const {
    reportTitle = 'Farm Report',
    period = 'All',
    summaryMetrics = {},
    salesRecords = null,
    expenseRecords = null,
    batchReports = null,
  } = reportPayload || {};

  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    attachment; filename="${reportTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf"
  );

  doc.pipe(res);

  doc.fontSize(16).font('Helvetica-Bold').text(reportTitle, { align: 'center' });
  doc.fontSize(10).font('Helvetica').text(Period / Scope: ${period}, { align: 'center' });
  doc.text(Generated On: ${new Date().toLocaleString()}, { align: 'center' });
  doc.moveDown(1.5);

  doc.fontSize(12).font('Helvetica-Bold').text('Executive Summary');
  doc.fontSize(10).font('Helvetica');
  Object.entries(summaryMetrics).forEach(([key, val]) => {
    const label = key.replace(/_/g, ' ').toUpperCase();
    doc.text(${label}: ${Number(val || 0).toFixed(2)});
  });
  doc.moveDown(1);

  if (Array.isArray(salesRecords)) {
    doc.fontSize(12).font('Helvetica-Bold').text('Sales Summary');
    doc.fontSize(9).font('Helvetica');
    salesRecords.forEach((s) => {
      doc.text(
        `${formatDate(s.sale_date)} | ${s.item_name} | ${s.kilos} kg @ ${s.price_per_kilo} = ${Number(
          s.total_amount || 0
        ).toFixed(2)}`
      );
    });
    doc.moveDown(1);
  }

  if (Array.isArray(expenseRecords)) {
    doc.fontSize(12).font('Helvetica-Bold').text('Expense Summary');
    doc.fontSize(9).font('Helvetica');
    expenseRecords.forEach((e) => {
      doc.text(
        `${formatDate(e.expense_date)} | [${e.category}] ${e.description || '-'} : ${Number(
          e.amount || 0
        ).toFixed(2)}`
      );
    });
    doc.moveDown(1);
  }

  if (Array.isArray(batchReports)) {
    doc.fontSize(12).font('Helvetica-Bold').text('Babuyan Per-Batch Breakdown');
    doc.fontSize(9).font('Helvetica');
    batchReports.forEach((b) => {
      const fs = b.financial_summary || {};
      doc.font('Helvetica-Bold').text(Batch: ${b.batch_id} (${b.batch_name || '-'}));
      doc.font('Helvetica').text(
        `Capital: ${Number(fs.capital || 0).toFixed(2)} | Feed: ${Number(fs.feed || 0).toFixed(
          2
        )} | Medicine: ${Number(fs.medicine || 0).toFixed(2)} | Other Expenses: ${Number(
          fs.other_expenses || 0
        ).toFixed(2)}`
      );
      doc.text(
        `Live Weight Sold: ${Number(fs.live_weight_sold_kg || 0)} kg | Income: ${Number(
          fs.income || 0
        ).toFixed(2)} | Net Profit: ${Number(fs.net_profit || 0).toFixed(2)}`
      );
      doc.moveDown(0.5);
    });
  }

  doc.end();
};

// ==========================================
// 4.5 SHARED EXCEL GENERATION ENGINE
// ==========================================
exports.generateSharedExcel = async (res, reportPayload) => {
  const {
    reportTitle = 'Farm Report',
    period = 'All',
    summaryMetrics = {},
    salesRecords = null,
    expenseRecords = null,
    batchReports = null,
  } = reportPayload || {};

  const workbook = new ExcelJS.Workbook();
  const summarySheet = workbook.addWorksheet('Summary');

  summarySheet.addRow([reportTitle]);
  summarySheet.addRow(['Period / Scope', period]);
  summarySheet.addRow(['Generated On', new Date().toLocaleString()]);
  summarySheet.addRow([]);
  summarySheet.addRow(['Metric', 'Value']);

  Object.entries(summaryMetrics).forEach(([key, val]) => {
    summarySheet.addRow([key.replace(/_/g, ' ').toUpperCase(), Number(val || 0)]);
  });

  if (Array.isArray(salesRecords)) {
    const salesSheet = workbook.addWorksheet('Sales Summary');
    salesSheet.addRow(['Date', 'Item', 'Kilos', 'Price / kg', 'Total Amount']);
    salesRecords.forEach((s) => {
      salesSheet.addRow([
        formatDate(s.sale_date),
        s.item_name,
        Number(s.kilos || 0),
        Number(s.price_per_kilo || 0),
        Number(s.total_amount || 0),
      ]);
    });
  }

  if (Array.isArray(expenseRecords)) {
    const expSheet = workbook.addWorksheet('Expense Summary');
    expSheet.addRow(['Date', 'Category', 'Description', 'Amount']);
    expenseRecords.forEach((e) => {
      expSheet.addRow([
        formatDate(e.expense_date),
        e.category,
        e.description || '-',
        Number(e.amount || 0),
      ]);
    });
  }

  if (Array.isArray(batchReports)) {
    const batchSheet = workbook.addWorksheet('Babuyan Per-Batch');
    batchSheet.addRow([
      'Batch ID',
      'Batch Name',
      'Capital',
      'Feed',
      'Medicine',
      'Other Expenses',
      'Total Expenses',
      'Live Weight Sold (kg)',
      'Income',
      'Net Profit',
    ]);
    batchReports.forEach((b) => {
      const fs = b.financial_summary || {};
      batchSheet.addRow([
        b.batch_id,
        b.batch_name || '-',
        Number(fs.capital || 0),
        Number(fs.feed || 0),
        Number(fs.medicine || 0),
        Number(fs.other_expenses || 0),
        Number(fs.total_expenses || 0),
        Number(fs.live_weight_sold_kg || 0),
        Number(fs.income || 0),
        Number(fs.net_profit || 0),
      ]);
    });
  }

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader(
    'Content-Disposition',
    attachment; filename="${reportTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}.xlsx"
  );

  await workbook.xlsx.write(res);
  res.end();
};