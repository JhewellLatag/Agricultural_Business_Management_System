// WBS 2.1.6, 3.1.2 — Babuyan Usage UI
// Assigned Member(s): Miguel Justin Javier, Ivan Lanaria
// NOTE: Shared modules are labeled with all applicable WBS responsibilities.
// Usage.jsx - feeds / medicine / vitamins na nilabas sa mga baboy (2.1.6)
// Staff at Admin pwede. Walang cost o profit dito.
import { useEffect, useState } from 'react';
import { api, fmtDate } from '../services/api.js';
import PageHeader from './PageHeader.jsx';
import DataTable from './DataTable.jsx';
import '../styles/forms.css';

export default function Usage() {
  const [items, setItems] = useState([]);
  const [batches, setBatches] = useState([]);
  const [data, setData] = useState({ records: [], mismatches: [] });
  const [msg, setMsg] = useState('');
  const blank = { item_id: '', batch_id: '', quantity: '', released_at: new Date().toISOString().slice(0, 10) };
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null); // { id, quantity }

  const load = () => {
    api.get('/inventory/babuyan').then(setItems);
    api.get('/batches').then(setBatches);
    api.get('/usage').then(setData);
  };
  useEffect(load, []);

  const run = async (fn) => {
    try { const r = await fn(); setMsg(r.message); load(); } catch (e) { setMsg(e.message); }
  };

  return (
    <>
      <PageHeader title="Released feeds & medicine" subtitle="Every release is deducted from the Babuyan inventory." />
      {msg && <div className="toast" onAnimationEnd={() => setMsg('')}>{msg}</div>}

      {/* Mismatch warning kapag hindi tugma ang records at inventory */}
      {data.mismatches.length > 0 && (
        <div className="warn-banner">
          Records and inventory do not match for: {data.mismatches.map((m) => m.name).join(', ')}. Check the usage records below.
        </div>
      )}

      <form className="card sale-form" onSubmit={(e) => { e.preventDefault();
        run(async () => { const r = await api.post('/usage', form); setForm(blank); return r; }); }}>
        <h3>Record release</h3>
        <div className="row">
          <select value={form.item_id} onChange={(e) => setForm({ ...form, item_id: e.target.value })}>
            <option value="">Choose item</option>
            {items.map((i) => <option key={i.id} value={i.id}>{i.name} ({i.quantity} {i.unit} left)</option>)}
          </select>
          <select value={form.batch_id} onChange={(e) => setForm({ ...form, batch_id: e.target.value })}>
            <option value="">Batch</option>
            {batches.map((b) => <option key={b.id} value={b.id}>Batch #{b.id}</option>)}
          </select>
          <input type="number" placeholder="Quantity" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
          <input type="date" value={form.released_at} onChange={(e) => setForm({ ...form, released_at: e.target.value })} />
          <button className="btn-primary">Save release</button>
        </div>
      </form>

      <div className="card">
        <DataTable
          empty="No releases yet."
          rows={data.records}
          columns={[
            { key: 'released_at', label: 'Date', render: (r) => fmtDate(r.released_at) },
            { key: 'name', label: 'Item' },
            { key: 'batch_id', label: 'Batch', render: (r) => (r.batch_id ? `#${r.batch_id}` : '-') },
            { key: 'quantity', label: 'Quantity', render: (r) => editing?.id === r.id ? (
              <input type="number" style={{ width: 90, margin: 0 }} value={editing.quantity} onChange={(e) => setEditing({ ...editing, quantity: e.target.value })} />
            ) : `${r.quantity} ${r.unit}` },
            { key: 'actions', label: '', render: (r) => editing?.id === r.id ? (
              <button className="btn-ghost" onClick={() => run(async () => { const x = await api.put(`/usage/${r.id}`, { quantity: editing.quantity }); setEditing(null); return x; })}>Save</button>
            ) : (
              <button className="btn-ghost" onClick={() => setEditing({ id: r.id, quantity: r.quantity })}>Edit</button>
            ) },
          ]}
        />
      </div>
    </>
  );
}
