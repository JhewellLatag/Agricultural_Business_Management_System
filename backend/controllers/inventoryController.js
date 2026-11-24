// WBS 2.1.1–2.1.4 — Inventory and Stock Movement
// Assigned Member(s): Miguel Justin Javier
// NOTE: Shared modules are labeled with all applicable WBS responsibilities.
// controllers/inventoryController.js - inventory ng 3 department (2.1)
const model = require('../models/inventoryModel');
const logActivity = require('../utils/activityLog');

// Babuyan categories: feed = sack, medicine at vitamin = bottle
const BABUYAN_CATEGORIES = { feed: 'sack', medicine: 'bottle', vitamin: 'bottle' };

// Listahan ng stock + low-stock at spoilage flags (2.1.4)
exports.list = async (req, res) => {
  const [rows] = await model.listDepartmentInventory([req.params.dept]);
  // hindi dapat makita ng staff ang cost
  if (req.user.role !== 'admin') rows.forEach((r) => { delete r.cost_per_kg; });
  res.json(rows);
};

// Admin: mag-add ng stock (may purchase cost per kilo)
exports.addStock = async (req, res) => {
  const { department, name, category, recorded_at } = req.body;
  const quantity = Number(req.body.quantity), cost = Number(req.body.cost_per_kg);
  const price = req.body.sell_price === '' || req.body.sell_price == null ? null : Number(req.body.sell_price);
  if (!['gulayan','prutasan','babuyan'].includes(department) || !String(name || '').trim() ||
      !Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(cost) || cost < 0 ||
      (price !== null && (!Number.isFinite(price) || price < 0))) return res.status(400).json({message:'Invalid stock quantity, cost or price.'});
  const cat = department === 'gulayan' ? 'vegetable' : department === 'prutasan' ? 'fruit' : category;
  if (department === 'babuyan' && !BABUYAN_CATEGORIES[cat]) return res.status(400).json({message:'Invalid Babuyan category.'});
  const unit = department === 'babuyan' ? BABUYAN_CATEGORIES[cat] : 'kg';
  const timestamp = recorded_at ? String(recorded_at).replace('T',' ') + (String(recorded_at).length === 16 ? ':00' : '') : null;
  if (timestamp && (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(timestamp) || Number.isNaN(Date.parse(timestamp.replace(' ','T'))))) return res.status(400).json({message:'Invalid date/time.'});
  const conn = await model.getConnection();
  try {
    await conn.beginTransaction();
    const [[found]] = await model.lockInventoryItemByName(conn, [department,name.trim()]);
    let itemId;
    if (found) {
      itemId=found.id;
      await model.addInventoryStock(conn, [quantity,cost,price,itemId]);
    } else {
      const [r]=await model.createInventoryItem(conn, [department,cat,name.trim(),unit,quantity,cost,Number(req.body.low_threshold)||10,price||0]);
      itemId=r.insertId;
    }
    await model.recordIncomingStock(conn, [itemId,quantity,cost,timestamp]);
    const amount=Math.round(quantity*cost*100)/100;
    if (amount>0) {
      const expCat=department==='babuyan' ? (cat==='feed'?'feed':'veterinary care') : 'sourcing';
      await model.createStockPurchaseExpense(conn, [department,expCat,amount,`Stock in: ${name.trim()} (${quantity} ${unit})`,timestamp]);
    }
    await conn.commit();
    await logActivity(req.user,department,`Added ${quantity} ${unit} of ${name.trim()}`);
    res.json({message:'Stock and purchase expense saved together.'});
  } catch(e) {await conn.rollback();res.status(400).json({message:e.message});}
  finally {conn.release();}
};

// Admin: i-edit ang name, quantity, cost, at low-stock level (2.1.1, 2.1.2)
exports.update = async (req,res) => {
  const { name, low_threshold, sell_price, cost_per_kg }=req.body;
  const conn=await model.getConnection();
  try {
    await conn.beginTransaction();
    const [[item]]=await model.lockInventoryItemForUpdate(conn, [req.params.id]);
    if (!item) {await conn.rollback();return res.status(404).json({message:'Item not found.'});}
    const quantity=req.body.quantity == null ? Number(item.quantity) : Number(req.body.quantity);
    const cost=cost_per_kg == null ? Number(item.cost_per_kg) : Number(cost_per_kg);
    const price=sell_price == null || sell_price === '' ? Number(item.sell_price) : Number(sell_price);
    if (!String(name||'').trim() || ![quantity,cost,price].every(Number.isFinite) || [quantity,cost,price].some(v=>v<0)) throw new Error('Invalid item details.');
    const diff=quantity-Number(item.quantity);
    await model.updateInventoryItem(conn, [name.trim(),quantity,cost,Number(low_threshold)||0,price,item.id]);
    if (Math.abs(diff)>0.00001) await model.recordStockAdjustment(conn, [item.id,diff>0?'in':'out',Math.abs(diff),'Inventory adjustment (not purchase/sale)',cost]);
    await conn.commit();
    await logActivity(req.user,item.department,`Updated ${item.name} (adjustment ${diff})`);
    res.json({message:'Item updated; quantity adjustment logged separately.'});
  } catch(e) {await conn.rollback();res.status(400).json({message:e.message});}
  finally {conn.release();}
};

// Archive rather than destroy historical stock, sales, usage, and audit evidence.
exports.remove = async (req, res) => {
  const [result] = await model.archiveInventoryItem([req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ message: 'Active item not found.' });
  await logActivity(req.user, null, `Archived inventory item #${req.params.id} (history retained)`);
  res.json({ message: 'Item archived. Its transaction and audit history is retained.' });
};

exports.addSpoilage = async (req, res) => {
  const { item_id, note } = req.body;
  const quantity = Number(req.body.quantity);
  if (!Number.isFinite(quantity) || quantity <= 0) return res.status(400).json({ message: 'Invalid spoilage quantity.' });
  const conn = await model.getConnection();
  try {
    await conn.beginTransaction();
    const [[item]] = await model.lockInventoryItemForSpoilage(conn, [item_id]);
    if (!item || item.department === 'babuyan' || quantity > Number(item.quantity)) throw new Error('Invalid item or insufficient stock.');
    await model.deductSpoiledStock(conn, [quantity, item_id]);
    await model.recordSpoilage(conn, [item_id, quantity, note || '', item.cost_per_kg]);
    await conn.commit();
    await logActivity(req.user, item.department, `Spoilage: ${quantity} of ${item.name}`);
    res.json({ message: 'Spoilage recorded.' });
  } catch (err) { await conn.rollback(); res.status(400).json({ message: err.message }); }
  finally { conn.release(); }
};

// WBS 2.1.3 — Automatically calculated daily movement from the immutable transaction ledger.
exports.movements = async (req, res) => {
  const date = String(req.query.date || new Date().toISOString().slice(0, 10));
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return res.status(400).json({message:'Invalid date.'});
  const dept = req.params.dept;
  const [rows] = await model.listDailyStockMovements([dept,date]);
  // Compute balances entirely from stock movement history; never ask staff to enter closing stock.
  const [closing] = await model.getDailyStockSummary([date,date,date,date,date,dept]);
  res.json({rows,closing});
};
