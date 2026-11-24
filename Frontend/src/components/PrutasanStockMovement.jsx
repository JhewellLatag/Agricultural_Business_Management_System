// WBS 2.1.3 — Stock Movement UI
// Assigned Member(s): Miguel Justin Javier
// NOTE: Shared modules are labeled with all applicable WBS responsibilities.
// MovementLog.jsx - daily stock movement (In/Out) at end-of-day closing stock (2.1.3)
import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import DataTable from './DataTable.jsx';

export default function PrutasanStockMovement() {
  const dept = 'prutasan';
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [data, setData] = useState({ rows: [], closing: [] });
  const [error, setError] = useState('');

  useEffect(() => { api.get(`/inventory/${dept}/movements?date=${date}`).then((result) => { setData(result); setError(''); }).catch((err) => setError(err.message)); }, [dept, date]);

  const typeBadge = { in: 'badge-ok', out: 'badge-warn', spoilage: 'badge-bad' };

  return (
    <div className="card">
      <div className="row between" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Daily stock movement — automatic</h3>
        <input type="date" style={{ width: 'auto' }} value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      <p className="view-note">Calculated from stock receipts, POS sales, spoilage and Babuyan usage. No manual closing stock entry.</p>
      {error && <p role="alert">{error}</p>}
      <DataTable
        empty="No movement on this day."
        rows={data.rows}
        columns={[
          { key: 'created_at', label: 'Time', render: (r) => String(r.created_at || '').slice(0, 19).replace('T', ' ') },
          { key: 'name', label: 'Item' },
          { key: 'type', label: 'Type', render: (r) => <span className={`badge ${typeBadge[r.type]}`}>{r.type}</span> },
          { key: 'quantity', label: 'Quantity', render: (r) => `${r.quantity} ${r.unit}` },
          { key: 'note', label: 'Note' },
        ]}
      />

      <h3 style={{ marginTop: 24 }}>End-of-day stock</h3>
      <DataTable
        empty="No items."
        rows={data.closing}
        columns={[
          { key: 'name', label: 'Item' },
          { key: 'opening', label: 'Opening', render: (r) => `${Number(r.opening)} ${r.unit}` },
          { key: 'stock_in', label: 'In', render: (r) => `+${Number(r.stock_in)} ${r.unit}` },
          { key: 'stock_out', label: 'Out', render: (r) => `-${Number(r.stock_out)} ${r.unit}` },
          { key: 'spoilage', label: 'Spoilage', render: (r) => `-${Number(r.spoilage)} ${r.unit}` },
          { key: 'closing', label: 'Closing (auto)', render: (r) => `${Number(r.closing)} ${r.unit}` },
        ]}
      />
    </div>
  );
}
