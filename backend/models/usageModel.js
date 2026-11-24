// WBS 2.1.6 — Babuyan Inventory Usage Matching
// Assigned Member(s): Miguel Justin Javier
// Database operations for usageController.js
const db = require('../config/db');

async function listUsageRecords() {
    return await db.query(`SELECT u.*, i.name, i.unit FROM usage_records u JOIN inventory_items i ON i.id=u.item_id ORDER BY u.released_at DESC,u.id DESC`);
}

async function getUsageReconciliation() {
    return await db.query(`SELECT i.id,i.name,i.unit,i.quantity,
    COALESCE((SELECT SUM(quantity) FROM usage_records WHERE item_id=i.id),0) recorded,
    COALESCE((SELECT SUM(IF(type='out',quantity,-quantity)) FROM stock_movements WHERE item_id=i.id AND note IN ('Usage','Usage edit')),0) deducted,
    COALESCE((SELECT SUM(IF(type='in',quantity,-quantity)) FROM stock_movements WHERE item_id=i.id),0) ledger
    FROM inventory_items i WHERE department='babuyan' AND is_archived=0`);
}

async function findBatchId(conn, values) {
    return await conn.query('SELECT id FROM batches WHERE id=?', values);
}

async function lockBabuyanInventoryItem(conn, values) {
    return await conn.query("SELECT * FROM inventory_items WHERE id=? AND department='babuyan' AND is_archived=0 FOR UPDATE", values);
}

async function createUsageRecord(conn, values) {
    return await conn.query('INSERT INTO usage_records (item_id,batch_id,quantity,released_at,recorded_by,unit_cost) VALUES (?,?,?,?,?,?)', values);
}

async function deductUsedStock(conn, values) {
    return await conn.query('UPDATE inventory_items SET quantity=quantity-? WHERE id=?', values);
}

async function recordUsageMovement(conn, values) {
    return await conn.query("INSERT INTO stock_movements (item_id,type,quantity,note,unit_cost) VALUES (?,'out',?,'Usage',?)", values);
}

async function lockUsageRecord(conn, values) {
    return await conn.query('SELECT * FROM usage_records WHERE id=? FOR UPDATE', values);
}

async function lockInventoryItem(conn, values) {
    return await conn.query('SELECT * FROM inventory_items WHERE id=? FOR UPDATE', values);
}

async function updateUsageQuantity(conn, values) {
    return await conn.query('UPDATE usage_records SET quantity=? WHERE id=?', values);
}

async function adjustUsedStock(conn, values) {
    return await conn.query('UPDATE inventory_items SET quantity=quantity-? WHERE id=?', values);
}

async function recordUsageAdjustment(conn, values) {
    return await conn.query('INSERT INTO stock_movements (item_id,type,quantity,note,unit_cost) VALUES (?,?,?,?,?)', values);
}

async function getConnection() {
    return await db.getConnection();
}

module.exports = {
    listUsageRecords,
    getUsageReconciliation,
    findBatchId,
    lockBabuyanInventoryItem,
    createUsageRecord,
    deductUsedStock,
    recordUsageMovement,
    lockUsageRecord,
    lockInventoryItem,
    updateUsageQuantity,
    adjustUsedStock,
    recordUsageAdjustment,
    getConnection
};
