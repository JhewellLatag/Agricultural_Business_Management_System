
// Database operations for seedAdmin.js
const db = require('../config/db');

async function createUserIfMissing(values) {
    return await db.query('INSERT IGNORE INTO users (name, username, password_hash, role) VALUES (?,?,?,?)', values);
}

module.exports = {
    createUserIfMissing
};
