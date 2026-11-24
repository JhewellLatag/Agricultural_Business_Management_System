// WBS 1.1–4.4 — Shared API Route Integration
// Assigned Member(s): John Adrian Alvarez, Jhewell Latag
// NOTE: Shared modules are labeled with all applicable WBS responsibilities.
// routes/index.js - lahat ng API routes + kung sino ang pwede
const router = require('express').Router();
const { authRequired, adminOnly, deptAccess } = require('../utils/auth');
const auth = require('../controllers/authController');
const inv = require('../controllers/inventoryController');
const sales = require('../controllers/salesController');
const gulayanSales = require('../controllers/gulayanSalesController');
const prutasanSales = require('../controllers/prutasanSalesController');
const babuyanSales = require('../controllers/babuyanSalesController');
const exp = require('../controllers/expenseController');
const live = require('../controllers/livestockController');
const audit = require('../controllers/auditController');
const usage = require('../controllers/usageController');
const health = require('../controllers/healthController');
const report = require('../controllers/reportController');
const overview = require('../controllers/overviewController');
const model = require('../models/indexRouteModel');

// wrapper para ma-catch ang errors ng async functions
const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);
// Babuyan staff at Admin lang
// WBS 1.3, 2.3, 3.1: only Admin may create, update, or archive inventory.
const inventoryWriter = (req, res, next) =>
  req.user.role === 'admin' ? next() : res.status(403).json({ message: 'Admin only.' });
const inventoryEditor = async (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only.' });
  const [[item]] = await model.getInventoryDepartment([req.params.id]);
  if (!item) return res.status(404).json({ message: 'Item not found.' });
  next();
};
const babuyanAccess = (req, res, next) =>
  ['admin', 'babuyan'].includes(req.user.role) ? next() : res.status(403).json({ message: 'Babuyan only.' });

router.post('/auth/login', wrap(auth.login));
router.get('/auth/session', authRequired, (req,res) => res.json({user:req.user}));

// Users (Admin)
router.get('/users', authRequired, adminOnly, wrap(auth.listUsers));
router.post('/users', authRequired, adminOnly, wrap(auth.createUser));
router.put('/users/:id', authRequired, adminOnly, wrap(auth.updateUser));

// Inventory: staff nakikita lang ang sarili nilang dept, Admin lang mag-edit
router.get('/inventory/:dept', authRequired, deptAccess, wrap(inv.list));
router.get('/inventory/:dept/movements', authRequired, deptAccess, wrap(inv.movements));
router.post('/inventory', authRequired, inventoryWriter, wrap(inv.addStock));
router.post('/inventory/spoilage', authRequired, adminOnly, wrap(inv.addSpoilage));
router.put('/inventory/:id', authRequired, wrap(inventoryEditor), wrap(inv.update));
router.delete('/inventory/:id', authRequired, wrap(inventoryEditor), wrap(inv.remove));

// Monthly audit (Admin)
router.get('/audit/:dept', authRequired, adminOnly, wrap(audit.log));
router.get('/audit/:dept/schedule', authRequired, adminOnly, wrap(audit.getSchedule));
router.put('/audit/:dept/schedule', authRequired, adminOnly, wrap(audit.setSchedule));
router.post('/audit', authRequired, adminOnly, wrap(audit.submit));
router.post('/audit/:id/approve', authRequired, adminOnly, wrap(audit.approve));
router.post('/audit/:id/reject', authRequired, adminOnly, wrap(audit.reject));

// Babuyan usage (staff + Admin)
router.get('/usage', authRequired, babuyanAccess, wrap(usage.list));
router.post('/usage', authRequired, (req,res,next) => req.user.role === 'babuyan' ? next() : res.status(403).json({message:'Babuyan staff only.'}), wrap(usage.create));
router.put('/usage/:id', authRequired, (req,res,next) => req.user.role === 'babuyan' ? next() : res.status(403).json({message:'Babuyan staff only.'}), wrap(usage.update));

// Sales
// WBS 1.1.1 / 1.1.2 / 1.1.4 — Department sales listing
router.get('/sales/:dept', authRequired, deptAccess, wrap((req, res) => ({ gulayan: gulayanSales, prutasan: prutasanSales, babuyan: babuyanSales }[req.params.dept] || sales).list(req, res)));
// WBS 1.1.1 / 1.1.2 / 1.1.4 — Department sales recording
router.post('/sales', authRequired, deptAccess, wrap((req, res) => ({ gulayan: gulayanSales, prutasan: prutasanSales, babuyan: babuyanSales }[req.body.department] || sales).create(req, res)));

// Expenses (Admin)
router.get('/expenses/:dept', authRequired, adminOnly, wrap(exp.list));
router.post('/expenses', authRequired, adminOnly, wrap(exp.create));

// Livestock (Admin)
router.get('/batches', authRequired, babuyanAccess, wrap(live.list)); // staff kailangan para sa usage form
router.post('/batches', authRequired, adminOnly, wrap(live.create));
router.put('/batches/:id', authRequired, adminOnly, wrap(live.update));
router.get('/batches/:id/profit', authRequired, adminOnly, wrap(live.profit));
router.get('/batches/:id/health', authRequired, adminOnly, wrap(health.list));
router.post('/batches/:id/health', authRequired, adminOnly, wrap(health.add));
router.put('/batches/:id/health/:logId', authRequired, adminOnly, wrap(health.update));
router.delete('/batches/:id/health/:logId', authRequired, adminOnly, wrap(health.remove));

// Reports at analytics (Admin)
router.get('/reports/monthly/:dept', authRequired, adminOnly, wrap(report.monthly));
router.get('/reports/batch/:id', authRequired, adminOnly, wrap(report.batch));
router.get('/reports/sales/:dept', authRequired, adminOnly, wrap(report.sales));
router.get('/reports/expenses/:dept', authRequired, adminOnly, wrap(report.expenses));
router.post('/reports/export', authRequired, adminOnly, wrap(report.exportFile));
router.get('/analytics/overview', authRequired, adminOnly, wrap(overview.overview)); // dapat nasa itaas ng :dept
router.get('/analytics/:dept', authRequired, adminOnly, wrap(report.analytics));

// Activity log (Admin) - may filters by user, department, date
router.get('/activity', authRequired, adminOnly, wrap(async (req, res) => {
  const { user = '', dept = '', date = '' } = req.query;
  const [rows] = await model.listFilteredActivityLogs([`%${user}%`, `%${dept}%`, date, date]);
  res.json(rows);
}));

module.exports = router;
