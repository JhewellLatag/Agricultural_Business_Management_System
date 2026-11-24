// WBS 3.1.1, 3.1.3 — Batch Management and Profit
// Assigned Member(s): Ivan Lanaria
// NOTE: Shared modules are labeled with all applicable WBS responsibilities.
// controllers/livestockController.js - pig batches (3.1)
const model = require('../models/babuyanProfitabilityModel');
const logActivity = require('../utils/activityLog');
const { batchProfit } = require('../services/profitService');

// Expected selling date = 4 months after purchase, may remaining days (3.1.1)
exports.list = async (req, res) => {
  const [rows] = await model.listBatches();
  const now = new Date();
  const todayUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());

  const batches = rows.map((b) => {
    // purchase_date ay "YYYY-MM-DD" kaya UTC ang gamit para walang off-by-one na araw
    const [y, m, d] = String(b.purchase_date).slice(0, 10).split('-').map(Number);
    const sell = new Date(Date.UTC(y, m - 1 + 4, d));
    const daysLeft = Math.round((sell.getTime() - todayUtc) / 86400000);
    const out = { ...b, expected_sell_date: sell.toISOString().slice(0, 10), days_left: daysLeft };
    if (req.user.role !== 'admin') delete out.capital_cost; // walang cost para sa staff
    return out;
  });
  res.json(batches);
};

exports.create = async (req, res) => {
  const { purchase_date, heads, capital_cost } = req.body;
  if (!purchase_date || !(heads > 0) || !(capital_cost > 0)) return res.status(400).json({ message: 'Fill in all fields.' });
  await model.createBatch([purchase_date, heads, capital_cost]);
  await logActivity(req.user, 'babuyan', `Added batch of ${heads} heads`);
  res.json({ message: 'Batch added.' });
};

// I-edit ang batch (3.1.1)
exports.update = async (req, res) => {
  const { purchase_date, heads, capital_cost } = req.body;
  if (!purchase_date || !(heads > 0) || !(capital_cost > 0)) return res.status(400).json({ message: 'Fill in all fields.' });
  await model.updateBatch([purchase_date, heads, capital_cost, req.params.id]);
  await logActivity(req.user, 'babuyan', `Edited batch #${req.params.id}`);
  res.json({ message: 'Batch updated.' });
};

// Admin only: cost, income, net profit per batch (3.1.3)
exports.profit = async (req, res) => {
  const data = await batchProfit(req.params.id);
  data ? res.json(data) : res.status(404).json({ message: 'Batch not found.' });
};
