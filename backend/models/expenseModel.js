// WBS 2.2.1–2.2.3 — Department Expenses
// Assigned Member(s): Miguel Justin Javier
// Database operations for expenseController.js
const db = require('../config/db');

async function listFilteredExpenses(values) {
    return await db.query(`SELECT * FROM expenses WHERE department=? AND spent_at BETWEEN ? AND ?
     AND (? = '' OR category = ?) ORDER BY spent_at DESC, id DESC`, values);
}

async function findBatchId(values) {
    return await db.query('SELECT id FROM batches WHERE id=?', values);
}

async function createExpense(values) {
    return await db.query('INSERT INTO expenses (department,batch_id,category,amount,note,spent_at) VALUES (?,?,?,?,?,?)', values);
}

module.exports = {
    listFilteredExpenses,
    findBatchId,
    createExpense
};
