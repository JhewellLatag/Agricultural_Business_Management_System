// WBS 3.1.3 — Livestock Production Cost and Profitability
// Assigned Member(s): Ivan Lanaria
// Database operations for babuyanProfitabilityService.js
const db = require('../config/db');

async function findBatchById(values) {
    return await db.query('SELECT * FROM batches WHERE id=?', values);
}

async function getBatchSalesTotals(values) {
    return await db.query("SELECT COALESCE(SUM(total),0) income,COALESCE(SUM(kilos),0) kilos FROM sales WHERE department='babuyan' AND batch_id=?", values);
}

async function getBatchExpenseBreakdown(values) {
    return await db.query("SELECT category,SUM(amount) total FROM expenses WHERE department='babuyan' AND batch_id=? GROUP BY category", values);
}

async function getBatchUsageCosts(values) {
    return await db.query(`SELECT i.category,COALESCE(SUM(u.quantity*COALESCE(u.unit_cost,i.cost_per_kg)),0) total FROM usage_records u JOIN inventory_items i ON i.id=u.item_id WHERE u.batch_id=? GROUP BY i.category`, values);
}

async function getMonthlySalesAndCogs(values) {
    return await db.query('SELECT COALESCE(SUM(total),0) sales,COALESCE(SUM(cogs),0) cogs FROM sales WHERE department=? AND sold_at LIKE ?', values);
}

async function getMonthlyOperatingExpenses(values) {
    return await db.query("SELECT COALESCE(SUM(amount),0) expenses FROM expenses WHERE department=? AND spent_at LIKE ? AND COALESCE(note,'') NOT LIKE 'Stock in:%'", values);
}

async function getMonthlySpoilageLoss(values) {
    return await db.query(`SELECT COALESCE(SUM(m.quantity*COALESCE(m.unit_cost,i.cost_per_kg)),0) loss FROM stock_movements m JOIN inventory_items i ON i.id=m.item_id WHERE i.department=? AND m.type='spoilage' AND m.created_at LIKE ?`, values);
}

module.exports = {
    findBatchById,
    getBatchSalesTotals,
    getBatchExpenseBreakdown,
    getBatchUsageCosts,
    getMonthlySalesAndCogs,
    getMonthlyOperatingExpenses,
    getMonthlySpoilageLoss
};
