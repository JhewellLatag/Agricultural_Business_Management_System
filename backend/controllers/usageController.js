// WBS 2.1.6 — Babuyan Inventory Usage Matching
// Assigned Member(s): Miguel Justin Javier
// NOTE: Shared modules are labeled with all applicable WBS responsibilities.
const model = require('../models/usageModel');
const logActivity = require('../utils/activityLog');

exports.list = async (req, res) => {
  const [records] = await model.listUsageRecords();
  const [items] = await model.getUsageReconciliation();
  const mismatches = items.filter(i => Math.abs(Number(i.recorded)-Number(i.deducted))>0.001 || Math.abs(Number(i.ledger)-Number(i.quantity))>0.001);
  res.json({ records, mismatches });
};

exports.create = async (req,res) => {
  const { item_id,batch_id,released_at } = req.body;
  const quantity = Number(req.body.quantity);
  if (!Number.isFinite(quantity) || quantity<=0 || !batch_id || !/^\d{4}-\d{2}-\d{2}$/.test(released_at || '')) return res.status(400).json({message:'Valid batch, date and positive quantity required.'});
  const conn=await model.getConnection();
  try {
    await conn.beginTransaction();
    const [[batch]]=await model.findBatchId(conn, [batch_id]);
    const [[item]]=await model.lockBabuyanInventoryItem(conn, [item_id]);
    if (!batch || !item || quantity>Number(item.quantity)) throw new Error('Batch/item missing or insufficient stock.');
    await model.createUsageRecord(conn, [item_id,batch_id,quantity,released_at,req.user.username,item.cost_per_kg]);
    await model.deductUsedStock(conn, [quantity,item_id]);
    await model.recordUsageMovement(conn, [item_id,quantity,item.cost_per_kg]);
    await conn.commit();
    await logActivity(req.user,'babuyan',`Released ${quantity} ${item.unit} of ${item.name} to batch ${batch_id}`);
    res.json({message:'Usage recorded.'});
  } catch(e) {await conn.rollback();res.status(400).json({message:e.message});}
  finally {conn.release();}
};

exports.update = async (req,res) => {
  const quantity=Number(req.body.quantity);
  if (!Number.isFinite(quantity) || quantity<=0) return res.status(400).json({message:'Positive quantity required.'});
  const conn=await model.getConnection();
  try {
    await conn.beginTransaction();
    const [[rec]]=await model.lockUsageRecord(conn, [req.params.id]);
    if (!rec) throw new Error('Usage record not found.');
    const [[item]]=await model.lockInventoryItem(conn, [rec.item_id]);
    if (!item || item.is_archived) throw new Error('Item is archived or missing.');
    const diff=quantity-Number(rec.quantity);
    if (diff>Number(item.quantity)) throw new Error('Not enough stock for this change.');
    await model.updateUsageQuantity(conn, [quantity,rec.id]);
    await model.adjustUsedStock(conn, [diff,item.id]);
    if (diff!==0) await model.recordUsageAdjustment(conn, [item.id,diff>0?'out':'in',Math.abs(diff),'Usage edit',rec.unit_cost ?? item.cost_per_kg]);
    await conn.commit();
    await logActivity(req.user,'babuyan',`Edited usage #${rec.id}: ${rec.quantity} to ${quantity}`);
    res.json({message:'Usage updated.'});
  } catch(e) {await conn.rollback();res.status(400).json({message:e.message});}
  finally {conn.release();}
};
