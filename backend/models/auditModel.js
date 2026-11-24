// WBS 2.1.5 — Monthly Physical Audit and Stock Adjustment
// Assigned Member(s): Miguel Justin Javier
// Database operations for auditController.js
const db = require('../config/db');

async function getSetting(values) {
    return await db.query('SELECT svalue FROM settings WHERE skey=?', values);
}

async function saveSetting(values) {
    return await db.query('INSERT INTO settings (skey, svalue) VALUES (?,?) ON DUPLICATE KEY UPDATE svalue=VALUES(svalue)', values);
}

async function findDepartmentInventoryItem(values) {
    return await db.query('SELECT * FROM inventory_items WHERE id=? AND department=?', values);
}

async function rejectSupersededAdjustments(values) {
    return await db.query("UPDATE stock_adjustments SET status='rejected', reason=CONCAT(COALESCE(reason,''),' [Superseded by new count]') WHERE item_id=? AND status='pending'", values);
}

async function createStockAdjustment(values) {
    return await db.query(`INSERT INTO stock_adjustments (audit_month,item_id,system_qty,counted_qty,difference,reason,status)
       VALUES (?,?,?,?,?,?, 'pending')`, values);
}

async function lockPendingAdjustment(conn, values) {
    return await conn.query("SELECT * FROM stock_adjustments WHERE id=? AND status='pending' FOR UPDATE", values);
}

async function lockInventoryItem(conn, values) {
    return await conn.query('SELECT * FROM inventory_items WHERE id=? FOR UPDATE', values);
}

async function setInventoryQuantity(conn, values) {
    return await conn.query('UPDATE inventory_items SET quantity=? WHERE id=?', values);
}

async function createStockMovement(conn, values) {
    return await conn.query('INSERT INTO stock_movements (item_id,type,quantity,note,unit_cost) VALUES (?,?,?,?,?)', values);
}

async function approveAdjustment(conn, values) {
    return await conn.query("UPDATE stock_adjustments SET status='approved' WHERE id=?", values);
}

async function rejectAdjustment(values) {
    return await db.query("UPDATE stock_adjustments SET status='rejected' WHERE id=? AND status='pending'", values);
}

async function listStockAdjustments(values) {
    return await db.query(`SELECT a.*, i.name FROM stock_adjustments a JOIN inventory_items i ON i.id=a.item_id
     WHERE i.department=? ORDER BY a.created_at DESC, a.id DESC`, values);
}

async function getConnection() {
    return await db.getConnection();
}

module.exports = {
    getSetting,
    saveSetting,
    findDepartmentInventoryItem,
    rejectSupersededAdjustments,
    createStockAdjustment,
    lockPendingAdjustment,
    lockInventoryItem,
    setInventoryQuantity,
    createStockMovement,
    approveAdjustment,
    rejectAdjustment,
    listStockAdjustments,
    getConnection
};
