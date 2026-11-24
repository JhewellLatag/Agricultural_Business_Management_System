// WBS 4.3.1 — Role-Based Access
// Assigned Member(s): Jhewell Latag
// Database operations for auth.js
const db = require('../config/db');

async function findActiveUserById(values) {
    return await db.query('SELECT id, username, name, role FROM users WHERE id=? AND active=1', values);
}

module.exports = {
    findActiveUserById
};
