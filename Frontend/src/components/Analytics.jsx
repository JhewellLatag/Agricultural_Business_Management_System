// WBS 4.2.1–4.2.3 — Department Analytics UI
// Assigned Member(s): Jhewell Latag
// NOTE: Shared modules are labeled with all applicable WBS responsibilities.
// Analytics.jsx - hiwalay na analytics page per department (4.2)
// Gumagamit ng graphs (bar, line, pie) galing sa Charts.jsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api, peso } from '../services/api.js';
import PageHeader from './PageHeader.jsx';
import { SimpleBar, SimpleLine, SimplePie, GroupedBar } from './Charts.jsx';

// kulay ng graph ayon sa department (kapareho ng theme sa global.css)
const COLORS = { gulayan: '#14935f', prutasan: '#ea7414', babuyan: '#d63a5c' };
const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const Panel = ({ title, children }) => (
  <div className="card chart-card"><h3>{title}</h3>{children}</div>
);

export default function Analytics({ dept: forced, embedded = false }) {
  const params = useParams();
  const dept = forced || params.dept;
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const color = COLORS[dept];

  useEffect(() => { let active = true; setData(null); setError(''); api.get(`/analytics/${dept}`).then(x => { if(active) setData(x); }).catch(e => { if(active) setError(e.message || 'Analytics unavailable'); }); return () => { active = false; }; }, [dept]);
  if (error) return <div className="card analytics-error"><h3>Could not load {dept} analytics</h3><p>{error}</p><button className="btn-primary" onClick={() => window.location.reload()}>Retry</button></div>;
  if (!data) return embedded ? <div className="empty-state">Loading...</div> : <PageHeader title={`${dept} analytics`} subtitle="Loading..." />;

  // Babuyan: comparison ng batches at profit trend
  if (dept === 'babuyan') {
    const b = (data?.batches || []).map((x) => ({
      label: x.label,
      value: x.costPerKilo,
      costPerKilo: x.costPerKilo,
      feedToWeight: x.feedToWeight,
      totalCost: x.totalCost,
      netProfit: x.netProfit,
    }));
    return (
      <>
        {!embedded && <PageHeader title="Babuyan analytics" subtitle="Compare batches to decide when to sell or expand the herd." />}
        <div className="analytics-grid">
          <Panel title="Cost per kilo of live weight">
            <SimpleBar data={b} color={color} format={peso} />
          </Panel>
          <Panel title="Feed-to-weight ratio (sacks per kilo sold)">
            <SimpleBar data={b.map((x) => ({ label: x.label, value: x.feedToWeight }))} color="#4263eb" format={(v) => Number(v).toFixed(3)} />
          </Panel>
          <Panel title="Cost vs profit per batch">
            <GroupedBar data={b} format={peso} series={[
              { key: 'totalCost', name: 'Total cost', color: '#d63a5c' },
              { key: 'netProfit', name: 'Net profit', color: '#14935f' },
            ]} />
          </Panel>
          <Panel title="Profit trend">
            <SimpleLine data={b.map((x) => ({ label: x.label, value: x.netProfit }))} color="#14935f" format={peso} />
          </Panel>
        </div>
      </>
    );
  }

  // Gulayan / Prutasan: ayusin ang peak days Lunes -> Linggo
  const peak = [...(data.peak || [])].sort((a, c) => DAY_ORDER.indexOf(a.label) - DAY_ORDER.indexOf(c.label));

  return (
    <>
      {!embedded && <PageHeader title={`${dept} analytics`} subtitle="Based on recorded sales, spoilage, and expenses." />}
      <div className="analytics-grid">
        <Panel title="Best-selling products (kg)">
          <SimpleBar data={data.best || []} color={color} horizontal format={(v) => `${v} kg`} />
        </Panel>
        <Panel title="Peak sales days">
          <SimpleBar data={peak} color={color} format={peso} />
        </Panel>
        <Panel title="Underperforming items (kg sold)">
          <SimpleBar data={data.under || []} color="#9aa5a0" horizontal format={(v) => `${v} kg`} />
        </Panel>
        <Panel title="Spoilage trend (kg per month)">
          <SimpleLine data={data.spoil || []} color="#d63a5c" format={(v) => `${v} kg`} />
        </Panel>
        <Panel title="Expense share">
          <SimplePie data={data.share || []} format={peso} />
        </Panel>
      </div>
    </>
  );
}
