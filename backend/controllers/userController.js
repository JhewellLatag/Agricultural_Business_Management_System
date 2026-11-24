// WBS 4.3.1 — User Account and RBAC
// Assigned Member(s): Jhewell Latag
// NOTE: Shared modules are labeled with all applicable WBS responsibilities.
// controllers/authController.js - login at user accounts (4.3.1)
const bcrypt = require('bcryptjs');
const model = require('../models/userModel');
const { signToken } = require('../utils/auth');
const logActivity = require('../utils/activityLog');

exports.login = async (req, res) => {
  const { username, password } = req.body;
  const [[user]] = await model.findActiveUserByUsername([username]);
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ message: 'Wrong username or password.' });
  }
  res.json({ token: signToken(user), user: { id: user.id, name: user.name, role: user.role } });
};

exports.listUsers = async (req, res) => {
  const [rows] = await model.listUsers();
  res.json(rows);
};

exports.createUser = async (req, res) => {
  const { name, username, password, role } = req.body;
  if (!name || !username || !password || !role) return res.status(400).json({ message: 'Fill in all fields.' });
  await model.createUser([name, username, await bcrypt.hash(password, 10), role]);
  await logActivity(req.user, role, `Created account ${username}`);
  res.json({ message: 'Account created.' });
};

// Admin: edit name, role, o i-deactivate ang account. May password reset kung may bagong password (4.3.1)
exports.updateUser = async (req, res) => {
  const { name, role, active, password } = req.body;
  const [[user]] = await model.findUserById([req.params.id]);
  if (!user) return res.status(404).json({ message: 'Account not found.' });
  if (password && password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' });
  if (!name) return res.status(400).json({ message: 'Name is required.' });

  // iwas mag-deactivate o mag-demote ng sariling admin account
  if (user.id === req.user.id && (!active || role !== 'admin')) {
    return res.status(400).json({ message: 'You cannot deactivate or demote your own account.' });
  }

  await model.updateUser([name, role, active ? 1 : 0, user.id]);
  if (password) {
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    await model.resetUserPassword([await bcrypt.hash(password, 10), user.id]);
  }
  await logActivity(req.user, role, `Updated account ${user.username}${password ? ' (password reset)' : ''}`);
  res.json({ message: 'Account updated.' });
};
