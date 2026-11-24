// SalesHistory.jsx - listahan ng benta (view-only), kasama na sa Inventory ng Admin
import { useEffect, useState } from 'react';
import { api, peso } from '../services/api.js';
import DataTable from './DataTable.jsx';

export default function SalesHistory({ dept }) {
  const [rows, setRows] = useState([]);
  useEffect(() => { api.get(`/sales/${dept}`).then(setRows).catch(() => setRows([])); }, [dept]);
  const columns = [
    { key: 'sold_at', label: 'Date', render: (r) => new Date(r.sold_at).toLocaleString() },
    { key: 'product', label: 'Product' },
    { key: 'kilos', label: 'Kilos' },
    { key: 'price_per_kilo', label: 'Price per kilo', render: (r) => peso(r.price_per_kilo) },
    { key: 'payment_method', label: 'Payment' },
    { key: 'total', label: 'Total', render: (r) => <strong>{peso(r.total)}</strong> },
  ];
  return <div className="card"><h3>{dept} sales</h3><DataTable columns={columns} rows={rows} empty="No sales yet." /></div>;
}
