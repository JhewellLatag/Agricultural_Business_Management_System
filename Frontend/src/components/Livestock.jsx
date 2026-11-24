// WBS 3.1.1, 3.1.3 — Livestock and Batch UI
// Assigned Member(s): Ivan Lanaria
// NOTE: Shared modules are labeled with all applicable WBS responsibilities.
// Livestock.jsx - pig batches, countdown, edit, at profit per batch (3.1, Admin only)
import { useEffect, useState } from 'react';
import { api, peso, fmtDate } from '../services/api.js';
import PageHeader from './PageHeader.jsx';
import HealthPanel from './HealthPanel.jsx';
import '../styles/forms.css';
import '../styles/livestock.css';

export default function Livestock() {
  const [batches, setBatches] = useState([]);
  const [profit, setProfit] = useState({}); // { batchId: data }
  const [msg, setMsg] = useState('');
  const [openId, setOpenId] = useState(null); // batch na nakabukas ang health logs
  const [editing, setEditing] = useState(null); // batch na ine-edit
  const empty = { purchase_date: new Date().toISOString().slice(0, 10), heads: '', capital_cost: '' };
  const [form, setForm] = useState(empty);

  const load = () => api.get('/batches').then(setBatches).catch((e) => setMsg(e.message));
  useEffect(() => { load(); }, []);

  const run = async (fn, after) => {
    try { const r = await fn(); setMsg(r.message); after?.(); load(); setProfit({}); } catch (err) { setMsg(err.message); }
  };

  // kunin ang cost breakdown, income at net profit ng isang batch
  const showProfit = async (id) => {
    const data = await api.get(`/batches/${id}/profit`);
    setProfit({ ...profit, [id]: data });
  };

  return (
    <>
      <PageHeader title="Livestock" subtitle="Pig batches with a four-month cycle." />
      {msg && <div className="toast" onAnimationEnd={() => setMsg('')}>{msg}</div>}

      <form className="card sale-form" onSubmit={(e) => { e.preventDefault(); run(() => api.post('/batches', form), () => setForm(empty)); }}>
        <h3>Add livestock</h3>
        <div className="row">
          <input type="date" value={form.purchase_date} onChange={(e) => setForm({ ...form, purchase_date: e.target.value })} />
          <input type="number" placeholder="Number of heads" value={form.heads} onChange={(e) => setForm({ ...form, heads: e.target.value })} />
          <input type="number" placeholder="Capital cost" value={form.capital_cost} onChange={(e) => setForm({ ...form, capital_cost: e.target.value })} />
          <button className="btn-primary">Add batch</button>
        </div>
      </form>

      <div className="batch-grid">
        {batches.map((b, i) => {
          const p = profit[b.id];
          // progress ng 120 days na cycle
          const progress = Math.min(100, Math.max(0, ((120 - b.days_left) / 120) * 100));
          const isEditing = editing?.id === b.id;
          return (
            <div className="batch-card" key={b.id} style={{ animationDelay: `${i * 80}ms` }}>
              <div className="batch-top">
                <h3>Batch #{b.id}</h3>
                <span className={`badge ${b.days_left <= 0 ? 'badge-ok' : 'badge-warn'}`}>
                  {b.days_left <= 0 ? 'Ready to sell' : `${b.days_left} days left`}
                </span>
              </div>

              {isEditing ? (
                <div className="edit-box">
                  <input type="date" value={String(editing.purchase_date).slice(0, 10)} onChange={(e) => setEditing({ ...editing, purchase_date: e.target.value })} />
                  <input type="number" placeholder="Heads" value={editing.heads} onChange={(e) => setEditing({ ...editing, heads: e.target.value })} />
                  <input type="number" placeholder="Capital cost" value={editing.capital_cost} onChange={(e) => setEditing({ ...editing, capital_cost: e.target.value })} />
                  <button className="btn-ghost" onClick={() => run(() => api.put(`/batches/${b.id}`, editing), () => setEditing(null))}>Save</button>
                  <button className="btn-link" onClick={() => setEditing(null)}>Cancel</button>
                </div>
              ) : (
                <>
                  <p>Bought {fmtDate(b.purchase_date)} · {b.heads} heads · capital {peso(b.capital_cost)}</p>
                  <p>Expected sale: {fmtDate(b.expected_sell_date)}</p>
                  <button className="btn-link" onClick={() => setEditing({ ...b })}>Edit batch</button>
                </>
              )}
              <div className="progress"><span style={{ width: `${progress}%` }} /></div>

              {p ? (
                <ul className="profit-list">
                  <li>Capital <b>{peso(p.capital)}</b></li>
                  <li>Feed <b>{peso(p.feed)}</b></li>
                  <li>Medicine / vet <b>{peso(p.medicine)}</b></li>
                  <li>Other expenses <b>{peso(p.other)}</b></li>
                  <li className="sum">Total raising cost <b>{peso(p.totalCost)}</b></li>
                  <li>Live weight sold <b>{p.kilosSold} kg</b></li>
                  <li>Income <b>{peso(p.income)}</b></li>
                  <li>Cost per kilo <b>{peso(p.costPerKilo)}</b></li>
                  <li className={p.netProfit >= 0 ? 'gain' : 'loss'}>Net profit <b>{peso(p.netProfit)}</b></li>
                </ul>
              ) : (
                <button className="btn-ghost" onClick={() => showProfit(b.id)}>View profit</button>
              )}
              <button className="btn-link" onClick={() => setOpenId(openId === b.id ? null : b.id)}>
                {openId === b.id ? 'Hide health logs' : 'Health logs'}
              </button>
              {openId === b.id && <HealthPanel batchId={b.id} />}
            </div>
          );
        })}
      </div>
    </>
  );
}
