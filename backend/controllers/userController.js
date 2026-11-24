const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { logActivity, getAuditLogs } = require('../services/auditLogger');

const VALID_ROLES = ['Admin', 'Gulayan Staff', 'Prutasan Staff', 'Babuyan Staff'];
const VALID_DEPARTMENTS = ['All', 'Gulayan', 'Prutasan', 'Babuyan'];

// ==========================================
// 4.2 USER ACCOUNT AND ROLE-BASED ACCESS (ADMIN)
// ==========================================

// Retrieve all user accounts
exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT id, username, full_name, department, role, status, created_at
       FROM users
       ORDER BY id DESC`
    );
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to retrieve user accounts.', error: error.message });
  }
};

// Admin creates a new user account with assigned department and role
exports.createUser = async (req, res) => {
  const { username, password, full_name, department, role } = req.body;

  if (!username || !password || !full_name || !department || !role) {
    return res.status(400).json({
      message: 'All fields (username, password, full name, department, role) are required.',
    });
  }

  if (!VALID_ROLES.includes(role) || !VALID_DEPARTMENTS.includes(department)) {
    return res.status(400).json({ message: 'Invalid department or role assignment.' });
  }

  try {
    const [existing] = await db.query(SELECT id FROM users WHERE username = ?, [username.trim()]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Username already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      `INSERT INTO users (username, password_hash, full_name, department, role, status)
       VALUES (?, ?, ?, ?, ?, 'active')`,
      [username.trim(), passwordHash, full_name.trim(), department, role]
    );

    await logActivity({
      user: req.user || null,
      department: 'All',
      module_name: 'User Account Management',
      action_type: 'ACCOUNT_CREATED',
      record_id: result.insertId,
      details: Created user '${username.trim()}' (${role} - ${department}),
    });

    return res.status(201).json({
      id: result.insertId,
      username: username.trim(),
      full_name: full_name.trim(),
      department,
      role,
      status: 'active',
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create user account.', error: error.message });
  }
};

// Admin edits user details, department, role, and optional password reset
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, full_name, department, role, password } = req.body;

  if (!username || !full_name || !department || !role) {
    return res.status(400).json({ message: 'Username, full name, department, and role are required.' });
  }

  if (!VALID_ROLES.includes(role) || !VALID_DEPARTMENTS.includes(department)) {
    return res.status(400).json({ message: 'Invalid department or role assignment.' });
  }

  try {
    const [duplicate] = await db.query(
      SELECT id FROM users WHERE username = ? AND id != ?,
      [username.trim(), id]
    );
    if (duplicate.length > 0) {
      return res.status(409).json({ message: 'Username is already taken by another user.' });
    }

    if (password && String(password).trim() !== '') {
      const passwordHash = await bcrypt.hash(password, 10);
      await db.query(
        `UPDATE users
         SET username = ?, full_name = ?, department = ?, role = ?, password_hash = ?
         WHERE id = ?`,
        [username.trim(), full_name.trim(), department, role, passwordHash, id]
      );
    } else {
      await db.query(
        `UPDATE users
         SET username = ?, full_name = ?, department = ?, role = ?
         WHERE id = ?`,
        [username.trim(), full_name.trim(), department, role, id]
      );
    }

    await logActivity({
      user: req.user || null,
      department: 'All',
      module_name: 'User Account Management',
      action_type: 'ACCOUNT_UPDATED',
      record_id: id,
      details: Updated user '${username.trim()}' (${role} - ${department}),
    });

    return res.status(200).json({ message: 'User account updated successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update user account.', error: error.message });
  }
};

// Admin deactivates or reactivates a user account
exports.toggleUserStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['active', 'deactivated'].includes(status)) {
    return res.status(400).json({ message: 'Invalid account status.' });
  }

  if (req.user && Number(id) === Number(req.user.id) && status === 'deactivated') {
    return res.status(400).json({ message: 'You cannot deactivate your own active Admin account.' });
  }

  try {
    await db.query(UPDATE users SET status = ? WHERE id = ?, [status, id]);

    await logActivity({
      user: req.user || null,
      department: 'All',
      module_name: 'User Account Management',
      action_type: status === 'deactivated' ? 'ACCOUNT_DEACTIVATED' : 'ACCOUNT_ACTIVATED',
      record_id: id,
      details: Changed user ID #${id} status to '${status}',
    });

    return res.status(200).json({ message: User account ${status}. });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update user status.', error: error.message });
  }
};

// ==========================================
// 4.4 ADMIN-ONLY SYSTEM ACTIVITY & AUDIT LOGS
// ==========================================
exports.getSystemAuditLogs = async (req, res) => {
  if (req.user && req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Admin only.' });
  }

  const { user, department, date } = req.query;

  try {
    const logs = await getAuditLogs({ user, department, date });
    return res.status(200).json(logs);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to retrieve system audit logs.', error: error.message });
  }
};