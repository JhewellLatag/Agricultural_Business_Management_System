// WBS 4.3.1 — Role-Based Access
// Assigned Member(s): Jhewell Latag
// NOTE: Shared modules are labeled with all applicable WBS responsibilities.
// utils/auth.js - login check at role-based access (RBAC)
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');
if (!process.env.JWT_SECRET) console.warn('JWT_SECRET not set: sessions expire on server restart. Set JWT_SECRET in your environment.');

// gumagawa ng token pagka-login
const signToken = (user) =>
  jwt.sign({ id: user.id, username: user.username, role: user.role }, SECRET, { expiresIn: '8h' });

// kailangan naka-login
const model = require('../models/authUtilityModel');
const authRequired = async (req, res, next) => {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, SECRET);
    const [[user]] = await model.findActiveUserById([decoded.id]);
    if (!user) return res.status(401).json({ message: 'Account unavailable.' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Please log in again.' });
  }
};

// Admin lang ang pwede
const adminOnly = (req, res, next) =>
  req.user.role === 'admin' ? next() : res.status(403).json({ message: 'Admin only.' });

// Admin = lahat ng department. Staff = sarili nilang department lang.
const deptAccess = (req, res, next) => {
  const dept = req.params.dept || req.body.department;
  if (req.user.role === 'admin' || req.user.role === dept) return next();
  res.status(403).json({ message: 'You cannot access this department.' });
};

module.exports = { signToken, authRequired, adminOnly, deptAccess };
