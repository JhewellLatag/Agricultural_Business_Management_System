// WBS 2.1.5 — Monthly Physical Audit and Stock Adjustment
// Assigned Member(s): Miguel Justin Javier
// NOTE: Shared modules are labeled with all applicable WBS responsibilities.
// controllers/auditController.js - monthly physical audit + adjustment log (2.1.5)
// Daloy: Admin nag-count -> "pending" ang difference -> i-approve -> saka lang magbabago ang stock.
const model = require('../models/auditModel');
const logActivity = require('../utils/activityLog');

const month = () => new Date().toISOString().slice(0, 7);

async function getSetting(key, fallback) {
  const [[row]] = await model.getSetting([key]);
  return row ? row.svalue : fallback;
}
async function setSetting(key, value) {
  await model.saveSetting([key, String(value)]);
}

// Schedule ng audit ng department: anong araw ng buwan, at kung due na
exports.getSchedule = async (req, res) => {
  const dept = req.params.dept;
  const day = Number(await getSetting(`audit_day_${dept}`, 25)); // default: ika-25
  const last = await getSetting(`audit_last_${dept}`, '');
  const due = new Date().getDate() >= day && last !== month();
  res.json({ day, lastAudit: last, due });
};

exports.setSchedule = async (req, res) => {
  const day = Number(req.body.day);
  if (!(day >= 1 && day <= 28)) return res.status(400).json({ message: 'Choose a day from 1 to 28.' });
  await setSetting(`audit_day_${req.params.dept}`, day);
  await logActivity(req.user, req.params.dept, `Set audit schedule to day ${day} of the month`);
  res.json({ message: 'Audit schedule saved.' });
};

// Admin nag-submit ng counted quantities. Ang difference ay pending muna.
exports.submit = async (req, res) => {
  const { department, counts } = req.body; // counts = [{ item_id, counted, reason }]
  let pending = 0;

  for (const c of counts) {
    if (c.counted === '' || c.counted == null) continue; // hindi binilang
    const [[item]] = await model.findDepartmentInventoryItem([c.item_id, department]);
    if (!item) continue;
    const diff = Number(c.counted) - Number(item.quantity);
    if (!Number.isFinite(Number(c.counted)) || Number(c.counted)<0) return res.status(400).json({message:'Invalid physical count.'});
    if (diff === 0) continue;

    // isang pending lang kada item
    await model.rejectSupersededAdjustments([item.id]);
    await model.createStockAdjustment([month(), item.id, item.quantity, c.counted, diff, c.reason || 'Monthly audit']);
    pending++;
  }
  await setSetting(`audit_last_${department}`, month());
  await logActivity(req.user, department, `Submitted audit count (${pending} difference(s))`);
  res.json({ message: pending ? `${pending} difference(s) waiting for approval.` : 'Count matches the system. No adjustments needed.' });
};

// Approve: dito lang tunay na nagbabago ang stock
exports.approve = async (req, res) => {
  const conn = await model.getConnection();
  try {
    await conn.beginTransaction();
    const [[adj]] = await model.lockPendingAdjustment(conn, [req.params.id]);
    if (!adj) throw new Error('Adjustment not found or already handled.');
    const [[item]] = await model.lockInventoryItem(conn, [adj.item_id]);
    if (!item || item.is_archived) throw new Error('Item is archived or missing.');
    // A physical count is a snapshot. If stock changed since counting, re-count rather than apply a stale difference.
    if (Math.abs(Number(item.quantity)-Number(adj.system_qty))>0.001) throw new Error('Stock changed since audit. Please submit a new physical count.');
    if (Number(adj.counted_qty)<0) throw new Error('Negative counted quantity.');
    await model.setInventoryQuantity(conn, [adj.counted_qty,item.id]);
    if (Number(adj.difference)!==0) await model.createStockMovement(conn, [item.id,adj.difference>0?'in':'out',Math.abs(Number(adj.difference)),'Audit adjustment',item.cost_per_kg]);
    await model.approveAdjustment(conn, [adj.id]);
    await conn.commit();
    await logActivity(req.user,item.department,`Approved audit adjustment ${item.name}: ${adj.difference}`);
    res.json({message:'Correction applied.'});
  } catch(e) {await conn.rollback();res.status(400).json({message:e.message});}
  finally {conn.release();}
};

exports.reject = async (req, res) => {
  const [r] = await model.rejectAdjustment([req.params.id]);
  if (!r.affectedRows) return res.status(404).json({ message: 'Adjustment not found or already handled.' });
  await logActivity(req.user, null, `Rejected audit adjustment #${req.params.id}`);
  res.json({ message: 'Adjustment rejected.' });
};

exports.log = async (req, res) => {
  const [rows] = await model.listStockAdjustments([req.params.dept]);
  res.json(rows);
};
