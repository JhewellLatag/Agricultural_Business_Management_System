// WBS 1.1.5, 2.2.4, 3.1.4, 4.1.1–4.2.3 — Reports and Analytics
// Assigned Member(s): John Adrian Alvarez, Miguel Justin Javier, Ivan Lanaria, Jhewell Latag
// NOTE: Shared modules are labeled with all applicable WBS responsibilities.
// controllers/reportController.js - reports at analytics (Admin only)
const svc = require('../services/reportService');

exports.monthly = async (req, res) => {
  const month = req.query.month || new Date().toISOString().slice(0, 7);
  res.json(await svc.monthlyFull(req.params.dept, month));
};

exports.batch = async (req, res) => {
  const data = await svc.batchReport(req.params.id);
  data ? res.json(data) : res.status(404).json({ message: 'Batch not found.' });
};

exports.analytics = async (req, res) => {
  const { dept } = req.params;
  res.json(dept === 'babuyan' ? await svc.babuyanAnalytics() : await svc.deptAnalytics(dept));
};

// 1.1.5 at 2.2.4: sales summary at expense summary
exports.sales = async (req, res) => {
  const month = req.query.month || new Date().toISOString().slice(0, 7);
  res.json(await svc.salesSummary(req.params.dept, month));
};

exports.expenses = async (req, res) => {
  const month = req.query.month || new Date().toISOString().slice(0, 7);
  res.json(await svc.expenseSummary(req.params.dept, month));
};

// 4.1.3: download ng PDF o Excel. Ang frontend ang nagpapadala ng laman ng report.
const exporter = require('../services/exportService');
exports.exportFile = async (req, res) => {
  const { format, title, sections } = req.body;
  if (!Array.isArray(sections)) return res.status(400).json({ message: 'Nothing to export.' });
  if (format === 'pdf') return exporter.sendPdf(res, title, sections);
  return exporter.sendExcel(res, title, sections);
};
