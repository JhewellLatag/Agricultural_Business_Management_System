// AnalyticsOverview.jsx - buod ng Gulayan at Prutasan: cards, sales overview, donut, recent sales, summary
import { useEffect, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { api, peso } from '../services/api.js';
import DataTable from './DataTable.jsx';

const GREEN = '#14935f', ORANGE = '#ea7414';
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export default function AnalyticsOverview() {
  const [d, setD] = useState(null);
  useEffect(() => { api.get('/analytics/overview').then(setD).catch(() => setD(false)); }, []);
  if (d === null) return <div className="empty-state">Loading...</div>;
  if (d === false) return <div className="empty-state">Could not load the overview.</div>;

  const pie = d.byDept.map((r) => ({ name: cap(r.department), value: r.sales, color: r.department === 'gulayan' ? GREEN : ORANGE }));
  const pct = (v) => (d.totalSales > 0 ? ((v / d.totalSales) * 100).toFixed(1) : '0.0');

  return (
    <>
      <div className="ov-cards">
        <div className="ov-card sales"><small>Total Sales</small><strong>{peso(d.totalSales)}</strong></div>
        <div className="ov-card exp"><small>Total Expenses</small><strong>{peso(d.totalExpenses)}</strong></div>
        <div className="ov-card net"><small>Net Profit (sales - expenses)</small><strong>{peso(d.netProfit)}</strong></div>
        <div className="ov-card stock"><small>Total Stock</small><strong>{Number(d.totalStock).toFixed(2)} kg</strong></div>
      </div>

      <div className="ov-grid">
        <div className="card chart-card">
          <h3>Sales Overview</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={d.series} margin={{ left: 4, right: 12 }}>
              <CartesianGrid strokeDasharray="2 6" stroke="#d5ddd8" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#667a70' }} axisLine={{ stroke: '#d5ddd8' }} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#667a70' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => peso(v)} contentStyle={{ borderRadius: 14, border: '1px solid #e3e8e4', boxShadow: '0 18px 40px -16px rgba(16,32,24,0.35)', fontWeight: 600 }} />
              <Line type="monotone" dataKey="gulayan" name="Gulayan" stroke={GREEN} strokeWidth={3} dot={false} activeDot={{ r: 6, strokeWidth: 3, stroke: '#fff' }} />
              <Line type="monotone" dataKey="prutasan" name="Prutasan" stroke={ORANGE} strokeWidth={3} dot={false} activeDot={{ r: 6, strokeWidth: 3, stroke: '#fff' }} />
            </LineChart>
          </ResponsiveContainer>
          <div className="legend-row"><span><i style={{ background: GREEN }} />Gulayan</span><span><i style={{ background: ORANGE }} />Prutasan</span></div>
        </div>
        <div className="card chart-card">
          <h3>Sales by Department</h3>
          {d.totalSales > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pie} dataKey="value" innerRadius={64} outerRadius={94} paddingAngle={2} cornerRadius={6} stroke="#fff" strokeWidth={3}>
                  {pie.map((p) => <Cell key={p.name} fill={p.color} />)}
                </Pie>
                <Tooltip formatter={(v) => peso(v)} contentStyle={{ borderRadius: 14, border: '1px solid #e3e8e4', boxShadow: '0 18px 40px -16px rgba(16,32,24,0.35)', fontWeight: 600 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="empty-state">No sales yet.</div>}
          <div className="legend-row">
            {pie.map((p) => <span key={p.name}><i style={{ background: p.color }} />{p.name} {peso(p.value)} ({pct(p.value)}%)</span>)}
          </div>
        </div>
      </div>

      <div className="ov-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="card">
          <h3>Recent Sales</h3>
          <DataTable empty="No sales yet." rows={d.recent.map((r, i) => ({ ...r, id: i }))} columns={[
            { key: 'sold_at', label: 'Date & Time', render: (r) => new Date(r.sold_at).toLocaleString() },
            { key: 'department', label: 'Department', render: (r) => cap(r.department) },
            { key: 'product', label: 'Item' },
            { key: 'kilos', label: 'Quantity', render: (r) => `${r.kilos} kg` },
            { key: 'total', label: 'Total', render: (r) => <strong>{peso(r.total)}</strong> },
          ]} />
        </div>
        <div className="card">
          <h3>Department Summary</h3>
          <DataTable empty="No data." rows={[...d.byDept.map((r) => ({ ...r, id: r.department })), { id: 'total', department: 'total', sales: d.totalSales, expenses: d.totalExpenses, netProfit: d.netProfit }]} columns={[
            { key: 'department', label: 'Department', render: (r) => (r.id === 'total' ? <strong>Total</strong> : cap(r.department)) },
            { key: 'sales', label: 'Total Sales', render: (r) => peso(r.sales) },
            { key: 'expenses', label: 'Total Expenses', render: (r) => peso(r.expenses) },
            { key: 'netProfit', label: 'Net Profit', render: (r) => <span className="gain">{peso(r.netProfit)}</span> },
          ]} />
        </div>
      </div>
    </>
  );
}
