// WBS 2.2.1 — Gulayan Expenses ONLY
// Assigned Member: Miguel Justin Javier
// WBS 2.2.1–2.2.3 — Department Expenses UI
// Assigned Member(s): Miguel Justin Javier
// Expenses.jsx - VIEW ONLY. Awtomatikong nagkakaroon ng record dito kapag may na-add na stock sa Inventory
// (tingnan ang addStock sa backend/controllers/inventoryController.js). Walang add form at walang date filter.
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api, peso, fmtDate } from '../services/api.js';
import PageHeader from './PageHeader.jsx';
import DataTable from './DataTable.jsx';
import '../styles/forms.css';

export default function GulayanExpenses({ dept: forced, embedded = false }) {
  const params = useParams();
  const dept = 'gulayan';
  const [data, setData] = useState({ categories: [], rows: [], totals: {}, grandTotal: 0 });
  const [category, setCategory] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => { setCategory(''); }, [dept]);
  useEffect(() => {
    api.get(`/expenses/${dept}?category=${encodeURIComponent(category)}`).then(setData).catch((e) => setMsg(e.message));
  }, [dept, category]);

  const columns = [
    { key: 'spent_at', label: 'Date', render: (r) => fmtDate(r.spent_at) },
    { key: 'category', label: 'Category', render: (r) => <span className="badge badge-ok">{r.category}</span> },
    ...(dept === 'babuyan' ? [{ key: 'batch_id', label: 'Batch', render: (r) => (r.batch_id ? `#${r.batch_id}` : '-') }] : []),
    { key: 'note', label: 'Note' },
    { key: 'amount', label: 'Amount', render: (r) => peso(r.amount) },
  ];

  return (
    <>
      {!embedded && <PageHeader title={`${dept} expenses`} subtitle={`View only. Total shown: ${peso(data.grandTotal)}`} />}
      {embedded && <p className="view-note">View only. Stock purchase expenses are calculated automatically from quantity × purchase cost when inventory is received. Total shown: <strong>{peso(data.grandTotal)}</strong></p>}
      {msg && <div className="toast" onAnimationEnd={() => setMsg('')}>{msg}</div>}

      <div className="chips">
        {data.categories.map((c) => (
          <button key={c} className={`chip ${category === c ? 'active' : ''}`} onClick={() => setCategory(category === c ? '' : c)}>
            <span>{c}</span><strong>{peso(data.totals[c] || 0)}</strong>
          </button>
        ))}
      </div>

      <div className="card"><DataTable columns={columns} rows={data.rows} empty="No expenses yet." /></div>
    </>
  );
}
