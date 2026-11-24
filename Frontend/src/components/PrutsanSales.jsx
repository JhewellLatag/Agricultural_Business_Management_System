// WBS 1.1.1–1.1.4 — Department Sales UI
// Assigned Member(s): John Adrian Alvarez
// NOTE: Shared modules are labeled with all applicable WBS responsibilities.
// Sales.jsx - sales recording at listahan (1.1)
// Gulayan/Prutasan: pumili ng product. Babuyan (Admin): pumili ng batch.
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api, peso } from '../services/api.js';
import PageHeader from './PageHeader.jsx';
import DataTable from './DataTable.jsx';
import '../styles/forms.css';

export default function PrutsanSales({ dept: forced, embedded = false }) {
  const params = useParams();
  const dept = 'prutasan';
  const isHog = dept === 'babuyan';

  const [sales, setSales] = useState([]);
  const [options, setOptions] = useState([]); // products o batches
  const [search, setSearch] = useState('');
  const [range, setRange] = useState({ from: '', to: '' }); // date filter
  const [msg, setMsg] = useState('');
  const empty = { target: '', kilos: '', price: '' };
  const [form, setForm] = useState(empty);

  const loadSales = () => api.get(`/sales/${dept}?search=${encodeURIComponent(search)}${range.from ? `&from=${range.from}` : ''}${range.to ? `&to=${range.to}` : ''}`).then(setSales).catch((e) => setMsg(e.message));

  useEffect(() => {
    loadSales();
    // listahan ng pwedeng ibenta
    (isHog ? api.get('/batches') : api.get(`/inventory/${dept}`)).then(setOptions).catch(() => {});
  }, [dept, search, range]);

  // preview ng total bago i-save
  const total = Number(form.kilos || 0) * Number(form.price || 0);

  const submit = async (e) => {
    e.preventDefault();
    try {
      const r = await api.post('/sales', {
        department: dept,
        item_id: isHog ? null : form.target,
        batch_id: isHog ? form.target : null,
        kilos: Number(form.kilos),
        price_per_kilo: Number(form.price),
        payment_method: 'Cash',
      });
      setMsg(`${r.message} Total ${peso(r.total)}`);
      setForm(empty);
      loadSales();
    } catch (err) {
      setMsg(err.message);
    }
  };

  const columns = [
    { key: 'sold_at', label: 'Date', render: (r) => new Date(r.sold_at).toLocaleDateString() },
    { key: 'product', label: 'Product' },
    { key: 'kilos', label: 'Kilos' },
    { key: 'price_per_kilo', label: 'Price per kilo', render: (r) => peso(r.price_per_kilo) },
    { key: 'payment_method', label: 'Payment' },
    { key: 'total', label: 'Total', render: (r) => <strong>{peso(r.total)}</strong> },
  ];

  return (
    <>
      {!embedded && <PageHeader title={`${dept} sales`} subtitle={isHog ? 'Record hog sales by live weight.' : 'Record sales per kilo.'} />}
      {msg && <div className="toast" onAnimationEnd={() => setMsg('')}>{msg}</div>}

      <form className="card sale-form" onSubmit={submit}>
        <h3>{isHog ? 'Add hog sale' : 'Add sale'}</h3>
        <div className="row">
          <select value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })}>
            <option value="">{isHog ? 'Choose batch' : 'Choose product'}</option>
            {options.map((o) => (
              <option key={o.id} value={o.id}>
                {isHog ? `Batch #${o.id} (${o.heads} heads)` : `${o.name} (${o.quantity} kg left)`}
              </option>
            ))}
          </select>
          <input type="number" placeholder={isHog ? 'Live weight (kg)' : 'Kilos'} value={form.kilos} onChange={(e) => setForm({ ...form, kilos: e.target.value })} />
          <input type="number" placeholder="Price per kilo" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        </div>
        <div className="row between">
          <span className="total-preview">Total: <strong>{peso(total)}</strong></span>
          <button className="btn-primary">Save sale</button>
        </div>
      </form>

      <div className="card">
        <div className="filter-row">
          <input placeholder="Search product..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <input type="date" title="From" value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} />
          <input type="date" title="To" value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} />
        </div>
        <DataTable columns={columns} rows={sales} empty="No sales yet." />
      </div>
    </>
  );
}
