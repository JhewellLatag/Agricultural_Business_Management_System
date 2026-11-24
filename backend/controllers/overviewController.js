// overviewController.js - buod para sa Analytics & Reports (Gulayan + Prutasan)
// Total sales, expenses, net profit, stock, 7-day sales, recent sales, at summary per department.
const model = require('../models/overviewModel');
const money = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;
const DEPTS = ['gulayan', 'prutasan'];

exports.overview = async (req, res) => {
  const [sales] = await model.getDepartmentSalesTotals();
  const [exps] = await model.getDepartmentExpenseTotals();
  const [[stock]] = await model.getTotalProduceStock();
  const [daily] = await model.getWeeklySalesTrend();
  const [recent] = await model.getRecentSales();

  const byDept = DEPTS.map((d) => {
    const s = Number((sales.find((x) => x.department === d) || {}).total || 0);
    const e = Number((exps.find((x) => x.department === d) || {}).total || 0);
    return { department: d, sales: money(s), expenses: money(e), netProfit: money(s - e) };
  });
  const totalSales = byDept.reduce((a, r) => a + r.sales, 0);
  const totalExpenses = byDept.reduce((a, r) => a + r.expenses, 0);

  // huling 7 araw, kasama ang araw na walang benta (0)
  const series = [];
  for (let i = 6; i >= 0; i--) {
    const dt = new Date(); dt.setDate(dt.getDate() - i);
    const day = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
    const pick = (d) => Number((daily.find((x) => x.day === day && x.department === d) || {}).total || 0);
    series.push({ day, label: dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), gulayan: pick('gulayan'), prutasan: pick('prutasan') });
  }

  res.json({
    totalSales: money(totalSales), totalExpenses: money(totalExpenses),
    netProfit: money(totalSales - totalExpenses), totalStock: money(stock.kg),
    byDept, series, recent,
  });
};
