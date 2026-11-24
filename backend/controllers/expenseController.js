// WBS 2.2.1–2.2.3 — Department Expenses
// Assigned Member(s): Miguel Justin Javier
// NOTE: Shared modules are labeled with all applicable WBS responsibilities.
// controllers/expenseController.js - expenses per department (2.2, Admin only)
const model = require('../models/expenseModel');
const logActivity = require('../utils/activityLog');

// Categories ayon sa work breakdown
const CATEGORIES = {
  gulayan: ['sourcing', 'logistics', 'labor', 'utilities'],
  prutasan: ['sourcing', 'storage', 'logistics', 'labor'],
  babuyan: ['feed', 'veterinary care', 'labor', 'utilities'],
};

// May date filter at category filter. Ibinabalik din ang total kada category (2.2.1 - 2.2.3)
exports.list = async (req, res) => {
  const { from = '1970-01-01', to = '2999-12-31', category = '' } = req.query;
  const [rows] = await model.listFilteredExpenses([req.params.dept, from, to, category, category]);

  // automatic totals
  const totals = {};
  rows.forEach((r) => { totals[r.category] = (totals[r.category] || 0) + Number(r.amount); });
  const grandTotal = Math.round(Object.values(totals).reduce((a, b) => a + b, 0) * 100) / 100;
  res.json({ categories: CATEGORIES[req.params.dept], rows, totals, grandTotal });
};

exports.create = async (req, res) => {
  const { department, batch_id, category, amount, note, spent_at } = req.body;
  if (!CATEGORIES[department]?.includes(category) || !(amount > 0)) {
    return res.status(400).json({ message: 'Choose a valid category and amount.' });
  }
  if (department === 'babuyan') {
    if (!batch_id) return res.status(400).json({ message: 'Choose a batch for Babuyan expenses.' });
    const [[batch]] = await model.findBatchId([batch_id]);
    if (!batch) return res.status(400).json({ message: 'Batch not found.' });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(spent_at || '')) return res.status(400).json({ message: 'Valid expense date required.' });
  await model.createExpense([department, batch_id || null, category, amount, note || '', spent_at]);
  await logActivity(req.user, department, `Expense ${category}: ${amount}`);
  res.json({ message: 'Expense saved.' });
};
