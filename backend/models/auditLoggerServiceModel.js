// WBS 4.4.1 — System Activity and Audit Logging
// Assigned Member(s): Jhewell Latag
// Database operations for auditLogger.js
const db = require('../config/db');

async function createActivityLog(values) {
    return await db.query('INSERT INTO activity_logs (user_id, username, department, action) VALUES (?,?,?,?)', values);
}

module.exports = {
    createActivityLog
};
