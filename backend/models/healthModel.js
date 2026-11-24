// WBS 3.1.2 — Livestock Growth and Health
// Assigned Member(s): Ivan Lanaria
// Database operations for healthController.js
const db = require('../config/db');

async function listBatchHealthRecords(values) {
    return await db.query('SELECT * FROM batch_health WHERE batch_id=? ORDER BY logged_at DESC, id DESC', values);
}

async function getBatchUsageSummary(values) {
    return await db.query(`SELECT i.name, i.unit, SUM(u.quantity) qty FROM usage_records u
     JOIN inventory_items i ON i.id=u.item_id WHERE u.batch_id=? GROUP BY i.id`, values);
}

async function listBatchUsageHistory(values) {
    return await db.query(`SELECT u.id, u.released_at, i.name, i.unit, u.quantity FROM usage_records u
     JOIN inventory_items i ON i.id=u.item_id WHERE u.batch_id=? ORDER BY u.released_at DESC, u.id DESC`, values);
}

async function createHealthRecord(values) {
    return await db.query('INSERT INTO batch_health (batch_id,type,value,note,logged_at) VALUES (?,?,?,?,?)', values);
}

async function findHealthRecord(values) {
    return await db.query('SELECT * FROM batch_health WHERE id=? AND batch_id=?', values);
}

async function updateHealthRecord(values) {
    return await db.query('UPDATE batch_health SET value=?, note=?, logged_at=? WHERE id=?', values);
}

async function deleteHealthRecord(values) {
    return await db.query('DELETE FROM batch_health WHERE id=? AND batch_id=?', values);
}

module.exports = {
    listBatchHealthRecords,
    getBatchUsageSummary,
    listBatchUsageHistory,
    createHealthRecord,
    findHealthRecord,
    updateHealthRecord,
    deleteHealthRecord
};
