// WBS 2.1.6 — Babuyan Inventory ONLY
// Assigned Member: Miguel Justin Javier
// WBS 2.1.1–2.1.6 — Department Inventory UI
// Assigned Member(s): Miguel Justin Javier
// NOTE: Shared modules are labeled with all applicable WBS responsibilities.
// Inventory.jsx - inventory ng Gulayan / Prutasan / Babuyan (2.1)
// Admin: Add stock, Edit, Delete, Spoilage. Staff: read-only.
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api, peso } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import PageHeader from './PageHeader.jsx';
import DataTable from './DataTable.jsx';
import MovementLog from './MovementLog.jsx';
import ProductImage from './ProductImage.jsx';
import '../styles/forms.css';

const CATEGORY_LABEL = { feed: 'Feeds', medicine: 'Medicine', vitamin: 'Vitamins', vegetable: 'Vegetable', fruit: 'Fruit' };

export default function AdminBabuyanStockIn({ dept: forced, embedded = false }) {
  const params = useParams();
  const dept = 'babuyan';
  const { user } = useAuth();
  const isAdmin = user.role === 'admin';
  const isBabuyan = dept === 'babuyan';
  const canManage = isAdmin;

  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState('');
  const blank = { name: '', category: 'feed', quantity: '', cost_per_kg: '', low_threshold: 10, sell_price: '', recorded_at: new Date(Date.now() - new Date().getTimezoneOffset()*60000).toISOString().slice(0,16) };
  const [form, setForm] = useState(blank);
  const [spoil, setSpoil] = useState({ item_id: '', quantity: '' });
  const [editing, setEditing] = useState(null); // item na ine-edit

  const load = () => api.get(`/inventory/${dept}`).then(setItems).catch((e) => setMsg(e.message));
  useEffect(() => { load(); setForm(blank); setEditing(null); }, [dept]);

  // pangkalahatang action: tatawag sa API, magpapakita ng message, tapos refresh
  const run = async (fn, after) => {
    try {
      const r = await fn();
      setMsg(r.message);
      after?.();
      load();
    } catch (e) {
      setMsg(e.message);
    }
  };

  const unit = isBabuyan ? (form.category === 'feed' ? 'sack' : 'bottle') : 'kg';
  const field = (key, props = {}) => (
    <input value={editing[key]} onChange={(e) => setEditing({ ...editing, [key]: e.target.value })} {...props} />
  );

  const columns = [
    { key: 'name', label: 'Item', render: (r) => editing?.id === r.id ? field('name', { style: { margin: 0 } }) : (
      <span className="prod-name">{!isBabuyan && <ProductImage key={r.name} name={r.name} size={32} />}{r.name}</span>
    ) },
    ...(isBabuyan ? [{ key: 'category', label: 'Type', render: (r) => CATEGORY_LABEL[r.category] || r.unit }] : []),
    { key: 'quantity', label: 'In stock', render: (r) => editing?.id === r.id
      ? field('quantity', { type: 'number', style: { margin: 0, width: 100 } }) : `${r.quantity} ${r.unit}` },
    ...(canManage ? [
      { key: 'cost_per_kg', label: isBabuyan ? 'Unit cost' : 'Cost per kg', render: (r) => editing?.id === r.id
        ? field('cost_per_kg', { type: 'number', style: { margin: 0, width: 100 } }) : peso(r.cost_per_kg) },
      { key: 'low_threshold', label: 'Low level', render: (r) => editing?.id === r.id
        ? field('low_threshold', { type: 'number', style: { margin: 0, width: 80 } }) : r.low_threshold },
    ] : []),
    ...(!isBabuyan ? [{ key: 'sell_price', label: 'Selling price', render: (r) => editing?.id === r.id
      ? field('sell_price', { type: 'number', style: { margin: 0, width: 100 } }) : `${peso(r.sell_price)} / kg` }] : []),
    { key: 'status', label: 'Status', render: (r) => (
      <>
        {r.is_low ? <span className="badge badge-warn">Low stock</span> : <span className="badge badge-ok">OK</span>}
        {Number(r.spoiled) > 0 && <span className="badge badge-bad">Spoilage {r.spoiled}</span>}
      </>
    ) },
    ...(canManage ? [{ key: 'actions', label: '', render: (r) => editing?.id === r.id ? (
      <div className="row-actions">
        <button className="btn-ghost" onClick={() => run(() => api.put(`/inventory/${r.id}`, editing), () => setEditing(null))}>Save</button>
        <button className="btn-link" onClick={() => setEditing(null)}>Cancel</button>
      </div>
    ) : (
      <div className="row-actions">
        <button className="btn-ghost" onClick={() => setEditing({ ...r })}>Edit</button>
        <button className="btn-danger small" onClick={() => window.confirm(`Delete ${r.name}? Its history will be removed too.`) && run(() => api.del(`/inventory/${r.id}`))}>Delete</button>
      </div>
    ) }] : []),
  ];

  return (
    <>
      {!embedded && <PageHeader title={`${dept} inventory`} subtitle={canManage ? 'Manage stock and record transactions.' : 'View only.'} />}
      {embedded && <p className="view-note">{canManage ? "Stock additions are logged with their date and time." : "View-only inventory. Babuyan staff manage stock."}</p>}
      {msg && <div className="toast" onAnimationEnd={() => setMsg('')}>{msg}</div>}

      {canManage && (
        <div className="form-grid">
          {/* Add Stock */}
          <form className="card" onSubmit={(e) => { e.preventDefault();
            run(() => api.post('/inventory', { ...form, department: dept }), () => setForm(blank)); }}>
            <h3>Add stock</h3>
            <input placeholder="Item name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            {/* Babuyan: hiwalay ang feeds, medicine, at vitamins */}
            {isBabuyan && (
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="feed">Feeds (sack)</option>
                <option value="medicine">Medicine (bottle)</option>
                <option value="vitamin">Vitamins (bottle)</option>
              </select>
            )}
            <input type="number" placeholder={`Quantity (${unit})`} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
            <input type="number" placeholder={isBabuyan ? 'Cost per unit' : 'Purchase cost per kilo'} value={form.cost_per_kg} onChange={(e) => setForm({ ...form, cost_per_kg: e.target.value })} />
            {!isBabuyan && <input type="number" placeholder="Selling price per kilo (POS)" value={form.sell_price} onChange={(e) => setForm({ ...form, sell_price: e.target.value })} />}
            <label className="field-label">Low-stock level<input type="number" placeholder="Low-stock level" value={form.low_threshold} onChange={(e) => setForm({ ...form, low_threshold: e.target.value })} /></label>
            {isBabuyan && <label className="field-label">Transaction date and time<input type="datetime-local" required value={form.recorded_at} onChange={e => setForm({...form, recorded_at:e.target.value})} /></label>}
            <button className="btn-primary">Add stock</button>
          </form>

          {/* Spoilage (hindi para sa Babuyan) */}
          {!isBabuyan && (
            <form className="card" onSubmit={(e) => { e.preventDefault();
              run(() => api.post('/inventory/spoilage', spoil), () => setSpoil({ item_id: '', quantity: '' })); }}>
              <h3>Record spoilage</h3>
              <select value={spoil.item_id} onChange={(e) => setSpoil({ ...spoil, item_id: e.target.value })}>
                <option value="">Choose item</option>
                {items.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
              </select>
              <input type="number" placeholder="Spoiled kilos" value={spoil.quantity} onChange={(e) => setSpoil({ ...spoil, quantity: e.target.value })} />
              <button className="btn-danger">Record loss</button>
            </form>
          )}
        </div>
      )}

      <div className="card"><DataTable columns={columns} rows={items} empty="No stock yet." /></div>

      {/* Daily log at closing stock: Gulayan at Prutasan lang */}
      <MovementLog dept={dept} key={items.length} />
    </>
  );
}
