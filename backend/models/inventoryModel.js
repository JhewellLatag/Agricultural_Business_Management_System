// WBS 2.1.1–2.1.4 — Inventory and Stock Movement
// Assigned Member(s): Miguel Justin Javier
// WBS 2.1.3 — Automatically calculated daily movement from the immutable transaction ledger.
// Database operations for inventoryController.js
const db = require('../config/db');

async function listDepartmentInventory(values) {
    return await db.query(`SELECT i.*,
       (i.quantity <= i.low_threshold) AS is_low,
       COALESCE((SELECT SUM(quantity) FROM stock_movements
                 WHERE item_id=i.id AND type='spoilage'),0) AS spoiled
     FROM inventory_items i WHERE department=? AND is_archived=0 ORDER BY name`, values);
}

async function lockInventoryItemByName(conn, values) {
    return await conn.query('SELECT id FROM inventory_items WHERE department=? AND name=? AND is_archived=0 FOR UPDATE', values);
}

async function addInventoryStock(conn, values) {
    return await conn.query('UPDATE inventory_items SET quantity=quantity+?,cost_per_kg=?,sell_price=COALESCE(?,sell_price) WHERE id=?', values);
}

async function createInventoryItem(conn, values) {
    return await conn.query('INSERT INTO inventory_items (department,category,name,unit,quantity,cost_per_kg,low_threshold,sell_price) VALUES (?,?,?,?,?,?,?,?)', values);
}

async function recordIncomingStock(conn, values) {
    return await conn.query("INSERT INTO stock_movements (item_id,type,quantity,note,unit_cost,created_at) VALUES (?,'in',?,'Stock in',?,COALESCE(?,NOW()))", values);
}

async function createStockPurchaseExpense(conn, values) {
    return await conn.query('INSERT INTO expenses (department,category,amount,note,spent_at) VALUES (?,?,?,?,COALESCE(DATE(?),CURDATE()))', values);
}

async function lockInventoryItemForUpdate(conn, values) {
    return await conn.query('SELECT * FROM inventory_items WHERE id=? AND is_archived=0 FOR UPDATE', values);
}

async function updateInventoryItem(conn, values) {
    return await conn.query('UPDATE inventory_items SET name=?,quantity=?,cost_per_kg=?,low_threshold=?,sell_price=? WHERE id=?', values);
}

async function recordStockAdjustment(conn, values) {
    return await conn.query('INSERT INTO stock_movements (item_id,type,quantity,note,unit_cost) VALUES (?,?,?,?,?)', values);
}

async function archiveInventoryItem(values) {
    return await db.query('UPDATE inventory_items SET is_archived=1 WHERE id=? AND is_archived=0', values);
}

async function lockInventoryItemForSpoilage(conn, values) {
    return await conn.query('SELECT * FROM inventory_items WHERE id=? AND is_archived=0 FOR UPDATE', values);
}

async function deductSpoiledStock(conn, values) {
    return await conn.query('UPDATE inventory_items SET quantity=quantity-? WHERE id=?', values);
}

async function recordSpoilage(conn, values) {
    return await conn.query("INSERT INTO stock_movements (item_id,type,quantity,note,unit_cost) VALUES (?, 'spoilage', ?, ?, ?)", values);
}

async function listDailyStockMovements(values) {
    return await db.query(`SELECT m.*, i.name, i.unit FROM stock_movements m JOIN inventory_items i ON i.id=m.item_id
     WHERE i.department=? AND DATE(m.created_at)=? ORDER BY m.created_at DESC,m.id DESC`, values);
}

async function getDailyStockSummary(values) {
    return await db.query(`
    SELECT i.id,i.name,i.unit,
      COALESCE(SUM(CASE WHEN DATE(m.created_at) < ? THEN
        CASE WHEN m.type='in' THEN m.quantity ELSE -m.quantity END ELSE 0 END),0) AS opening,
      COALESCE(SUM(CASE WHEN DATE(m.created_at) = ? AND m.type='in' THEN m.quantity ELSE 0 END),0) AS stock_in,
      COALESCE(SUM(CASE WHEN DATE(m.created_at) = ? AND m.type='out' THEN m.quantity ELSE 0 END),0) AS stock_out,
      COALESCE(SUM(CASE WHEN DATE(m.created_at) = ? AND m.type='spoilage' THEN m.quantity ELSE 0 END),0) AS spoilage,
      COALESCE(SUM(CASE WHEN DATE(m.created_at) <= ? THEN
        CASE WHEN m.type='in' THEN m.quantity ELSE -m.quantity END ELSE 0 END),0) AS closing
    FROM inventory_items i LEFT JOIN stock_movements m ON m.item_id=i.id
    WHERE i.department=? GROUP BY i.id,i.name,i.unit ORDER BY i.name`, values);
}

async function getConnection() {
    return await db.getConnection();
}

module.exports = {
    listDepartmentInventory,
    lockInventoryItemByName,
    addInventoryStock,
    createInventoryItem,
    recordIncomingStock,
    createStockPurchaseExpense,
    lockInventoryItemForUpdate,
    updateInventoryItem,
    recordStockAdjustment,
    archiveInventoryItem,
    lockInventoryItemForSpoilage,
    deductSpoiledStock,
    recordSpoilage,
    listDailyStockMovements,
    getDailyStockSummary,
    getConnection
};
