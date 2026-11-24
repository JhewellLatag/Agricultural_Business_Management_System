// WBS 3.1.2 — Livestock Health UI
// Assigned Member(s): Ivan Lanaria
// NOTE: Shared modules are labeled with all applicable WBS responsibilities.
// HealthPanel.jsx - weight, vaccination, mortality, water, at daily consumption ng isang batch (3.1.2)
import { useEffect, useState } from 'react';
import { api, fmtDate } from '../services/api.js';

const TYPES = {
  weight: 'Average weight (kg)',
  vaccination: 'Vaccination',
  mortality: 'Mortality (heads)',
  water: 'Water (liters)',
};

export default function HealthPanel({ batchId }) {
  const [data, setData] = useState({ logs: [], usage: [], usageLogs: [] });
  const [form, setForm] = useState({ type: 'weight', value: '', note: '' });
  const [editing, setEditing] = useState(null); // log na ine-edit
  const [tab, setTab] = useState('health'); // health | usage
  const [error, setError] = useState('');

  const load = () => api.get(`/batches/${batchId}/health`).then(setData);
  useEffect(() => { load(); }, [batchId]);

  const run = async (fn, after) => {
    setError('');
    try { await fn(); after?.(); load(); } catch (err) { setError(err.message); }
  };

  const add = (e) => {
    e.preventDefault();
    run(() => api.post(`/batches/${batchId}/health`, { ...form, logged_at: new Date().toISOString().slice(0, 10) }),
      () => setForm({ ...form, value: '', note: '' }));
  };

  return (
    <div className="health-panel">
      <form onSubmit={add} className="health-form">
        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          {Object.entries(TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        {form.type === 'vaccination'
          ? <input placeholder="Vaccine name" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          : <input type="number" placeholder="Value" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />}
        <button className="btn-ghost">Add</button>
      </form>
      {error && <p className="form-error">{error}</p>}

      <div className="mini-tabs">
        <button className={tab === 'health' ? 'active' : ''} onClick={() => setTab('health')}>Health logs</button>
        <button className={tab === 'usage' ? 'active' : ''} onClick={() => setTab('usage')}>Daily consumption</button>
      </div>

      {tab === 'health' && (
        <ul className="log-list">
          {data.logs.length === 0 && <li>No logs yet.</li>}
          {data.logs.map((l) => (
            <li key={l.id}>
              <span>{fmtDate(l.logged_at)} · {l.type}</span>
              {editing?.id === l.id ? (
                <span className="log-edit">
                  {l.type === 'vaccination'
                    ? <input value={editing.note} onChange={(e) => setEditing({ ...editing, note: e.target.value })} />
                    : <input type="number" value={editing.value} onChange={(e) => setEditing({ ...editing, value: e.target.value })} />}
                  <button className="btn-link" onClick={() => run(() => api.put(`/batches/${batchId}/health/${l.id}`, editing), () => setEditing(null))}>Save</button>
                  <button className="btn-link" onClick={() => setEditing(null)}>Cancel</button>
                </span>
              ) : (
                <span className="log-edit">
                  <b>{l.type === 'vaccination' ? l.note : l.value}</b>
                  <button className="btn-link" onClick={() => setEditing({ id: l.id, value: l.value, note: l.note, logged_at: String(l.logged_at).slice(0, 10) })}>Edit</button>
                  <button className="btn-link" onClick={() => window.confirm('Delete this log?') && run(() => api.del(`/batches/${batchId}/health/${l.id}`))}>Delete</button>
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* feeds / medicine / vitamins na galing sa Babuyan staff, kada araw */}
      {tab === 'usage' && (
        <>
          {data.usage.length > 0 && <p className="usage-line">Total: {data.usage.map((u) => `${u.name} ${u.qty} ${u.unit}`).join(', ')}</p>}
          <ul className="log-list">
            {data.usageLogs.length === 0 && <li>No releases recorded for this batch.</li>}
            {data.usageLogs.map((u) => (
              <li key={u.id}><span>{fmtDate(u.released_at)} · {u.name}</span><b>{u.quantity} {u.unit}</b></li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
