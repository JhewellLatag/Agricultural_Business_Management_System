// WBS 3.1.2 — Livestock Growth and Health
// Assigned Member(s): Ivan Lanaria
// NOTE: Shared modules are labeled with all applicable WBS responsibilities.
// controllers/healthController.js - weight, vaccination, mortality, water (3.1.2)
const model = require('../models/babuyanGrownthHealthModel');
const logActivity = require('../utils/activityLog');

exports.list = async (req, res) => {
  const [logs] = await model.listBatchHealthRecords([req.params.id]);
  // feeds / medicine / vitamins na naka-link sa batch
  const [usage] = await model.getBatchUsageSummary([req.params.id]);
  // daily log ng feeds / medicine / vitamins na nilabas para sa batch na ito
  const [usageLogs] = await model.listBatchUsageHistory([req.params.id]);
  res.json({ logs, usage, usageLogs });
};

exports.add = async (req, res) => {
  const { type, value, note, logged_at } = req.body;
  if (!['weight', 'vaccination', 'mortality', 'water'].includes(type)) return res.status(400).json({ message: 'Invalid log type.' });
  if (type !== 'vaccination' && !(value > 0)) return res.status(400).json({ message: 'Enter a value.' });
  await model.createHealthRecord([req.params.id, type, value || null, note || '', logged_at]);
  await logActivity(req.user, 'babuyan', `Batch ${req.params.id} ${type} log`);
  res.json({ message: 'Log saved.' });
};

// I-update ang isang health log (3.1.2 "store and update")
exports.update = async (req, res) => {
  const { value, note, logged_at } = req.body;
  const [[log]] = await model.findHealthRecord([req.params.logId, req.params.id]);
  if (!log) return res.status(404).json({ message: 'Log not found.' });
  if (log.type !== 'vaccination' && !(value > 0)) return res.status(400).json({ message: 'Enter a value.' });
  await model.updateHealthRecord([log.type === 'vaccination' ? null : value, note || '', logged_at || log.logged_at, log.id]);
  await logActivity(req.user, 'babuyan', `Edited ${log.type} log of batch ${req.params.id}`);
  res.json({ message: 'Log updated.' });
};

exports.remove = async (req, res) => {
  const [r] = await model.deleteHealthRecord([req.params.logId, req.params.id]);
  if (!r.affectedRows) return res.status(404).json({ message: 'Log not found.' });
  await logActivity(req.user, 'babuyan', `Deleted a health log of batch ${req.params.id}`);
  res.json({ message: 'Log deleted.' });
};
