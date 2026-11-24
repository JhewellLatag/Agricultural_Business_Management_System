// WBS 3.1.1, 3.1.3 — Batch Management and Profit
// Assigned Member(s): Ivan Lanaria
// Database operations for babuyanController.js
const db = require('../config/db');

async function listBatches() {
    return await db.query('SELECT * FROM batches ORDER BY purchase_date DESC');
}

async function createBatch(values) {
    return await db.query('INSERT INTO batches (purchase_date, heads, capital_cost) VALUES (?,?,?)', values);
}

async function updateBatch(values) {
    return await db.query('UPDATE batches SET purchase_date=?, heads=?, capital_cost=? WHERE id=?', values);
}

module.exports = {
    listBatches,
    createBatch,
    updateBatch
};
