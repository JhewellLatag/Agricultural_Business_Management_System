// WBS 4.1.1–4.2.3 — Reports and Analytics Calculations
// Assigned Member(s): Jhewell Latag
// Database operations for analyticsService.js
const db = require('../config/db');

async function getMonthlyStockMovement(values) {
    return await db.query(`SELECT SUM(IF(m.type='in',m.quantity,0)) stockIn,
            SUM(IF(m.type='out',m.quantity,0)) stockOut,
            SUM(IF(m.type='spoilage',m.quantity,0)) spoiled
     FROM stock_movements m JOIN inventory_items i ON i.id=m.item_id
     WHERE i.department=? AND m.created_at LIKE ?`, values);
}

async function getMonthlyExpensesByCategory(values) {
    return await db.query('SELECT category, SUM(amount) total FROM expenses WHERE department=? AND spent_at LIKE ? GROUP BY category', values);
}

async function getLatestBatchWeight(values) {
    return await db.query("SELECT value FROM batch_health WHERE batch_id=? AND type='weight' ORDER BY logged_at DESC, id DESC LIMIT 1", values);
}

async function getBatchMortalityTotal(values) {
    return await db.query("SELECT COALESCE(SUM(value),0) dead FROM batch_health WHERE batch_id=? AND type='mortality'", values);
}

async function getBatchVaccinationCount(values) {
    return await db.query("SELECT COUNT(*) n FROM batch_health WHERE batch_id=? AND type='vaccination'", values);
}

async function getBatchUsageSummary(values) {
    return await db.query(`SELECT i.name, i.unit, SUM(u.quantity) qty FROM usage_records u
     JOIN inventory_items i ON i.id=u.item_id WHERE u.batch_id=? GROUP BY i.id`, values);
}

async function getTopSellingProducts(values) {
    return await db.query('SELECT product label, SUM(kilos) value FROM sales WHERE department=? GROUP BY product ORDER BY value DESC LIMIT 5', values);
}

async function getSlowMovingProducts(values) {
    return await db.query(`SELECT i.name label, COALESCE(SUM(s.kilos),0) value FROM inventory_items i
     LEFT JOIN sales s ON s.item_id=i.id WHERE i.department=? GROUP BY i.id ORDER BY value ASC LIMIT 5`, values);
}

async function getSalesByWeekday(values) {
    return await db.query('SELECT DAYNAME(sold_at) label, SUM(total) value FROM sales WHERE department=? GROUP BY DAYNAME(sold_at) ORDER BY value DESC', values);
}

async function getMonthlySpoilageTrend(values) {
    return await db.query(`SELECT DATE_FORMAT(m.created_at,'%Y-%m') label, SUM(m.quantity) value FROM stock_movements m
     JOIN inventory_items i ON i.id=m.item_id WHERE i.department=? AND m.type='spoilage' GROUP BY label ORDER BY label`, values);
}

async function getExpenseBreakdown(values) {
    return await db.query('SELECT category label, SUM(amount) value FROM expenses WHERE department=? GROUP BY category ORDER BY value DESC', values);
}

async function listBatchIds() {
    return await db.query('SELECT id FROM batches ORDER BY purchase_date');
}

async function getBatchFeedUsage(values) {
    return await db.query(`SELECT COALESCE(SUM(u.quantity),0) feed FROM usage_records u
       JOIN inventory_items i ON i.id=u.item_id WHERE u.batch_id=? AND (i.category='feed' OR i.unit='sack')`, values);
}

async function getBatchSalesTotals() {
    return await db.query(`SELECT batch_id, SUM(kilos) kilos, SUM(total) income FROM sales
       WHERE department='babuyan' GROUP BY batch_id ORDER BY batch_id`);
}

async function getMonthlyProductSales(values) {
    return await db.query(`SELECT product, COUNT(*) transactions, SUM(kilos) kilos, SUM(total) total, SUM(cogs) cogs
     FROM sales WHERE department=? AND sold_at LIKE ? GROUP BY product ORDER BY total DESC`, values);
}

async function getMonthlyExpenseBreakdown(values) {
    return await db.query('SELECT category, SUM(amount) total FROM expenses WHERE department=? AND spent_at LIKE ? GROUP BY category ORDER BY total DESC', values);
}

async function getBatchExpenseTotals() {
    return await db.query(`SELECT batch_id, category, SUM(amount) total FROM expenses
       WHERE department='babuyan' AND batch_id IS NOT NULL GROUP BY batch_id, category ORDER BY batch_id`);
}

module.exports = {
    getMonthlyStockMovement,
    getMonthlyExpensesByCategory,
    getLatestBatchWeight,
    getBatchMortalityTotal,
    getBatchVaccinationCount,
    getBatchUsageSummary,
    getTopSellingProducts,
    getSlowMovingProducts,
    getSalesByWeekday,
    getMonthlySpoilageTrend,
    getExpenseBreakdown,
    listBatchIds,
    getBatchFeedUsage,
    getBatchSalesTotals,
    getMonthlyProductSales,
    getMonthlyExpenseBreakdown,
    getBatchExpenseTotals
};
