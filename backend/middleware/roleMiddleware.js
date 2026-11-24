const { signToken, authRequired } = require('../utils/auth');
const adminOnly = (req, res, next) =>
  req.user.role === 'admin' ? next() : res.status(403).json({ message: 'Admin only.' });

// Admin = lahat ng department. Staff = sarili nilang department lang.
const deptAccess = (req, res, next) => {
  const dept = req.params.dept || req.body.department;
  if (req.user.role === 'admin' || req.user.role === dept) return next();
  res.status(403).json({ message: 'You cannot access this department.' });
};

module.exports = { signToken, authRequired, adminOnly, deptAccess, authenticateSession: authRequired };
