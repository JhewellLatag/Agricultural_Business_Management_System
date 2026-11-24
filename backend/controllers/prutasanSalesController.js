// WBS 1.1.2 — Prutasan Sales Recording ONLY
// Assigned Member: John Adrian Alvarez
// WBS 1.1.1–1.1.4 — Shared Sales Recording and Records
// Assigned Member(s): John Adrian Alvarez
// NOTE: Shared modules are labeled with all applicable WBS responsibilities.
// controllers/salesController.js - sales recording (1.1)
const model = require('../models/prutasanSalesModel');
const logActivity = require('../utils/activityLog');

// Listahan ng sales per department, may search at date filter (1.1.3)
exports.list = async (req, res) => {
  if (req.params.dept !== 'prutasan') return res.status(400).json({ message: 'Invalid department.' });
  // hog sales (income) ay Admin lang
  if (req.params.dept === 'babuyan' && req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only.' });
  const { search = '', from = '1970-01-01', to = '2999-12-31' } = req.query;
  const [rows] = await model.listDepartmentSales([req.params.dept, `%${search}%`, from, to]);
  // hindi dapat makita ng staff ang cost of goods sold
  if (req.user.role !== 'admin') rows.forEach((r) => delete r.cogs);
  res.json(rows);
};

// Gulayan / Prutasan: record per-kilo sale + auto deduct sa inventory (1.1.1, 1.1.2)
// Babuyan (Admin): hog sale kada batch = live weight x price per kilo (1.1.4)
exports.create = async (req, res) => {
  const { department, item_id, batch_id } = req.body;
  if (department !== 'prutasan') return res.status(400).json({ message: 'Invalid department.' });
  const kilos = Number(req.body.kilos);
  let price_per_kilo = Number(req.body.price_per_kilo);
  if (!['gulayan', 'prutasan', 'babuyan'].includes(department)) return res.status(400).json({ message: 'Invalid department.' });
  if (!Number.isFinite(Number(kilos)) || !Number.isFinite(Number(price_per_kilo)) || !(kilos > 0) || !(price_per_kilo > 0)) return res.status(400).json({ message: 'Kilos and price must be more than 0.' });

  let total = kilos * price_per_kilo;

  // Hog sale
  if (department === 'babuyan') {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Only the Admin can record hog sales.' });
    const [[batch]] = await model.findBatchId([batch_id]);
    if (!batch) return res.status(400).json({ message: 'Choose an existing batch.' });
    await model.createLivestockSale([batch_id, `Hog (Batch #${batch_id})`, kilos, price_per_kilo, 'Cash', total]);
    await logActivity(req.user, 'babuyan', `Hog sale: ${kilos} kg for batch ${batch_id}`);
    return res.json({ message: 'Hog sale saved.', total });
  }

  // Gulayan / Prutasan: transaction para sabay mag-save at mag-deduct
  const conn = await model.getConnection();
  try {
    await conn.beginTransaction();
    const [[item]] = await model.lockDepartmentInventoryItem(conn, [item_id, department]);
    if (!item) throw new Error('Product not found.');
    if (kilos > item.quantity) throw new Error(`Only ${item.quantity} kg left in stock.`);

    if (req.user.role !== 'admin') {
      price_per_kilo = Number(item.sell_price);
      if (!(price_per_kilo > 0)) throw new Error('Product has no selling price.');
      total = kilos * price_per_kilo;
    }
    const cogs = kilos * item.cost_per_kg; // cost of goods sold
    await model.createProduceSale(conn, [department, item_id, item.name, kilos, price_per_kilo, 'Cash', total, cogs]);
    await model.deductInventoryStock(conn, [kilos, item_id]);
    await model.recordSaleStockMovement(conn, [item_id, kilos]);
    await model.createActivityLog(conn, [req.user.id,req.user.username,department,`Sale: ${kilos} kg ${item.name}`]);
    await conn.commit();
    res.json({ message: 'Sale saved.', total });
  } catch (err) {
    await conn.rollback();
    res.status(400).json({ message: err.message });
  } finally {
    conn.release();
  }
};
