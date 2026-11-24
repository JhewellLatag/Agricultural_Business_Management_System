// WBS 4.3.1 — User Account and RBAC
// Assigned Member(s): Jhewell Latag
// Database operations for authController.js
const db = require('../config/db');

async function findActiveUserByUsername(values) {
    return await db.query('SELECT * FROM users WHERE username=? AND active=1', values);
}

async function listUsers() {
    return await db.query('SELECT id, name, username, role, active FROM users');
}

async function createUser(values) {
    return await db.query('INSERT INTO users (name, username, password_hash, role) VALUES (?,?,?,?)', values);
}

async function findUserById(values) {
    return await db.query('SELECT * FROM users WHERE id=?', values);
}

async function updateUser(values) {
    return await db.query('UPDATE users SET name=?, role=?, active=? WHERE id=?', values);
}

async function resetUserPassword(values) {
    return await db.query('UPDATE users SET password_hash=? WHERE id=?', values);
}

module.exports = {
    findActiveUserByUsername,
    listUsers,
    createUser,
    findUserById,
    updateUser,
    resetUserPassword
};
