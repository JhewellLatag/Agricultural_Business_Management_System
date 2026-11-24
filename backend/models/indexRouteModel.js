// WBS 1.1–4.4 — Shared API Route Integration
// Assigned Member(s): John Adrian Alvarez, Jhewell Latag
// WBS 1.3, 2.3, 3.1: only Admin may create, update, or archive inventory.
// WBS 1.1.1 / 1.1.2 / 1.1.4 — Department sales listing
// WBS 1.1.1 / 1.1.2 / 1.1.4 — Department sales recording
// Database operations for index.js
const db = require('../config/db');

async function getInventoryDepartment(values) {
    return await db.query('SELECT department FROM inventory_items WHERE id=?', values);
}

async function listFilteredActivityLogs(values) {
    return await db.query(`SELECT * FROM activity_logs WHERE username LIKE ? AND COALESCE(department,'') LIKE ?
     AND (? = '' OR DATE(created_at) = ?) ORDER BY created_at DESC LIMIT 300`, values);
}

module.exports = {
    getInventoryDepartment,
    listFilteredActivityLogs
};
