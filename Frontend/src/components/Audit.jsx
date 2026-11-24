// WBS 2.1.5 — Physical Audit UI
// Assigned Member(s): Miguel Justin Javier
// NOTE: Shared modules are labeled with all applicable WBS responsibilities.
// Audit.jsx - monthly physical audit, approval, at stock-adjustment log (2.1.5, Admin only)
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api, fmtDate } from '../services/api.js';
import PageHeader from './PageHeader.jsx';
import DataTable from './DataTable.jsx';
import '../styles/forms.css';

const STATUS_BADGE = { pending: 'badge-warn', approved: 'badge-ok', rejected: 'badge-bad' };

export default function Audit() {
  const { dept } = useParams();
  const [items, setItems] = useState([]);
  const [log, setLog] = useState([]);
  const [schedule, setSchedule] = useState({ day: 25, due: false, lastAudit: '' });
  const [counts, setCounts] = useState({}); // { itemId: { counted, reason } }
  const [msg, setMsg] = useState('');

  const load = () => {
    api.get(`/inventory/${dept}`).then(setItems);
    api.get(`/audit/${dept}`).then(setLog);
    api.get(`/audit/${dept}/schedule`).then(setSchedule);
  };
  useEffect(() => { load(); setCounts({}); }, [dept]);

  const run = async (fn, after) => {
    try { const r = await fn(); setMsg(r.message); after?.(); load(); } catch (e) { setMsg(e.message); }
  };
  const setField = (id, field, value) => setCounts({ ...counts, [id]: { ...counts[id], [field]: value } });

  const submit = () => {
    const list = Object.entries(counts).map(([item_id, c]) => ({ item_id, ...c }));
    run(() => api.post('/audit', { department: dept, counts: list }), () => setCounts({}));
  };

  return (
    <>
      <PageHeader title={`${dept} audit`} subtitle="Count the stock, then approve the corrections." />
      {msg && <div className="toast" onAnimationEnd={() => setMsg('')}>{msg}</div>}

      {/* Paalala kapag due na ang audit */}
      {schedule.due && <div className="warn-banner">Monthly audit is due. It is scheduled every day {schedule.day} of the month.</div>}

      <div className="card">
        <h3>Audit schedule</h3>
        <div className="filter-row" style={{ alignItems: 'center' }}>
          <span>Every day</span>
          <input type="number" min="1" max="28" value={schedule.day} onChange={(e) => setSchedule({ ...schedule, day: e.target.value })} />
          <span>of the month</span>
          <button className="btn-ghost" onClick={() => run(() => api.put(`/audit/${dept}/schedule`, { day: schedule.day }))}>Save schedule</button>
        </div>
        <p style={{ color: 'var(--muted)' }}>Last audit submitted: {schedule.lastAudit || 'none yet'}</p>
      </div>

      <div className="card">
        <h3>Physical count</h3>
        <DataTable
          empty="No items to audit."
          rows={items}
          columns={[
            { key: 'name', label: 'Item' },
            { key: 'quantity', label: 'System qty', render: (r) => `${r.quantity} ${r.unit}` },
            { key: 'counted', label: 'Counted', render: (r) => (
              <input type="number" style={{ width: 110, margin: 0 }} value={counts[r.id]?.counted ?? ''} onChange={(e) => setField(r.id, 'counted', e.target.value)} />
            ) },
            { key: 'diff', label: 'Difference', render: (r) => {
              const c = counts[r.id]?.counted;
              if (c === undefined || c === '') return '-';
              const d = Number(c) - Number(r.quantity);
              return <span className={`badge ${d === 0 ? 'badge-ok' : 'badge-bad'}`}>{d > 0 ? '+' : ''}{d}</span>;
            } },
            { key: 'reason', label: 'Reason', render: (r) => (
              <input placeholder="Reason" style={{ margin: 0 }} value={counts[r.id]?.reason ?? ''} onChange={(e) => setField(r.id, 'reason', e.target.value)} />
            ) },
          ]}
        />
        <button className="btn-primary" style={{ marginTop: 16 }} onClick={submit}>Submit count</button>
      </div>

      <div className="card">
        <h3>Stock-adjustment log</h3>
        <DataTable
          empty="No adjustments yet."
          rows={log}
          columns={[
            { key: 'created_at', label: 'Date', render: (r) => fmtDate(r.created_at) },
            { key: 'name', label: 'Item' },
            { key: 'difference', label: 'Difference', render: (r) => `${r.difference > 0 ? '+' : ''}${r.difference}` },
            { key: 'reason', label: 'Reason' },
            { key: 'status', label: 'Status', render: (r) => <span className={`badge ${STATUS_BADGE[r.status]}`}>{r.status}</span> },
            { key: 'actions', label: '', render: (r) => r.status === 'pending' && (
              <div className="row-actions">
                <button className="btn-ghost" onClick={() => run(() => api.post(`/audit/${r.id}/approve`))}>Approve</button>
                <button className="btn-danger small" onClick={() => run(() => api.post(`/audit/${r.id}/reject`))}>Reject</button>
              </div>
            ) },
          ]}
        />
      </div>
    </>
  );
}
