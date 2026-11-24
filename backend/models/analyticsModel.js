
// Database operations for analyticsController.js
const db = require('../config/db');

async function getDepartmentSalesTotals() {
    return await db.query("SELECT department, COALESCE(SUM(total),0) total FROM sales WHERE department IN ('gulayan','prutasan') GROUP BY department");
}

async function getDepartmentExpenseTotals() {
    return await db.query("SELECT department, COALESCE(SUM(amount),0) total FROM expenses WHERE department IN ('gulayan','prutasan') GROUP BY department");
}

async function getTotalProduceStock() {
    return await db.query("SELECT COALESCE(SUM(quantity),0) kg FROM inventory_items WHERE department IN ('gulayan','prutasan') AND is_archived=0");
}

async function getWeeklySalesTrend() {
    return await db.query(`SELECT DATE_FORMAT(sold_at,'%Y-%m-%d') day, department, SUM(total) total FROM sales
     WHERE department IN ('gulayan','prutasan') AND sold_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
     GROUP BY day, department`);
}

async function getRecentSales() {
    return await db.query("SELECT sold_at, department, product, kilos, total FROM sales WHERE department IN ('gulayan','prutasan') ORDER BY sold_at DESC LIMIT 5");
}

module.exports = {
    getDepartmentSalesTotals,
    getDepartmentExpenseTotals,
    getTotalProduceStock,
    getWeeklySalesTrend,
    getRecentSales
};
