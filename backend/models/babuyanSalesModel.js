// WBS 1.1.4 — Babuyan Sales Recording ONLY
// Assigned Member: John Adrian Alvarez
// WBS 1.1.1–1.1.4 — Shared Sales Recording and Records
// Assigned Member(s): John Adrian Alvarez
// Database operations for babuyanSalesController.js
const db = require('../config/db');

async function listDepartmentSales(values) {
    return await db.query(`SELECT * FROM sales WHERE department=? AND product LIKE ?
     AND DATE(sold_at) BETWEEN ? AND ? ORDER BY sold_at DESC`, values);
}

async function findBatchId(values) {
    return await db.query('SELECT id FROM batches WHERE id=?', values);
}

async function createLivestockSale(values) {
    return await db.query(`INSERT INTO sales (department,batch_id,product,kilos,price_per_kilo,payment_method,total)
       VALUES ('babuyan',?,?,?,?,?,?)`, values);
}

async function lockDepartmentInventoryItem(conn, values) {
    return await conn.query('SELECT * FROM inventory_items WHERE id=? AND department=? AND is_archived=0 FOR UPDATE', values);
}

async function createProduceSale(conn, values) {
    return await conn.query(`INSERT INTO sales (department,item_id,product,kilos,price_per_kilo,payment_method,total,cogs)
       VALUES (?,?,?,?,?,?,?,?)`, values);
}

async function deductInventoryStock(conn, values) {
    return await conn.query('UPDATE inventory_items SET quantity=quantity-? WHERE id=?', values);
}

async function recordSaleStockMovement(conn, values) {
    return await conn.query("INSERT INTO stock_movements (item_id,type,quantity,note) VALUES (?, 'out', ?, 'Sale')", values);
}

async function createActivityLog(conn, values) {
    return await conn.query('INSERT INTO activity_logs (user_id,username,department,action) VALUES (?,?,?,?)', values);
}

async function getConnection() {
    return await db.getConnection();
}

module.exports = {
    listDepartmentSales,
    findBatchId,
    createLivestockSale,
    lockDepartmentInventoryItem,
    createProduceSale,
    deductInventoryStock,
    recordSaleStockMovement,
    createActivityLog,
    getConnection
};
