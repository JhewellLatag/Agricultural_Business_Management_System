// WBS 1.1.5, 2.2.4, 3.1.4, 4.1.1–4.1.3 — Reports UI
// Assigned Member(s): John Adrian Alvarez, Miguel Justin Javier, Ivan Lanaria, Jhewell Latag
// NOTE: Shared modules are labeled with all applicable WBS responsibilities.
// Reports.jsx - lahat ng reports (4.1, 1.1.5, 2.2.4, 3.1.4)
// Print = browser print. PDF at Excel = totoong file galing sa backend.
import { useEffect, useState } from 'react';
import { api, peso, downloadFile } from '../services/api.js';
import PageHeader from './PageHeader.jsx';
import DataTable from './DataTable.jsx';
import '../styles/forms.css';
import '../styles/reports.css';
import DeptTabs from './DeptTabs.jsx';

// Isang "section" = { title, columns: [labels], rows: [[values]] }
// Ito ang ginagamit pareho sa screen at sa export, kaya laging magkapareho.
const kv = (title, pairs) => ({ title, columns: ['Item', 'Value'], rows: pairs });

export default function AdminReportsScreen() {
  const [dept, setDept] = useState('gulayan');
  const [kind, setKind] = useState('monthly'); // monthly | sales | expenses
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [batches, setBatches] = useState([]);
  const [batchId, setBatchId] = useState('');
  const [sections, setSections] = useState([]);
  const [msg, setMsg] = useState('');
  const isHog = dept === 'babuyan';

  useEffect(() => { if (isHog) api.get('/batches').then(setBatches); }, [dept]);

  // buuin ang report sections ayon sa napiling dept at uri ng report
  useEffect(() => {
    setSections([]);
    const build = async () => {
      if (kind === 'monthly' && !isHog) {
        const m = await api.get(`/reports/monthly/${dept}?month=${month}`);
        return [
          kv(`${dept} monthly report - ${month}`, [
            ['Sales', peso(m.sales)], ['Cost of goods sold', peso(m.cogs)], ['Expenses', peso(m.expenses)],
            ['Spoilage loss', peso(m.spoilageLoss)], ['Stock in (kg)', m.stockIn], ['Stock out (kg)', m.stockOut],
            ['Spoiled (kg)', m.spoiled], ['Net profit', peso(m.netProfit)],
          ]),
          { title: 'Expenses by category', columns: ['Category', 'Total'], rows: m.expenseByCategory.map((c) => [c.category, peso(c.total)]) },
        ];
      }
      if (kind === 'monthly' && isHog) {
        if (!batchId) return [];
        const b = await api.get(`/reports/batch/${batchId}`);
        return [
          kv(`Babuyan batch #${batchId} report`, [
            ['Capital', peso(b.capital)], ['Feed', peso(b.feed)], ['Medicine / vet', peso(b.medicine)],
            ['Other expenses', peso(b.other)], ['Total raising cost', peso(b.totalCost)],
            ['Live weight sold (kg)', b.kilosSold], ['Income', peso(b.income)], ['Cost per kilo', peso(b.costPerKilo)],
            ['Net profit', peso(b.netProfit)], ['Latest average weight (kg)', b.latestWeight],
            ['Mortality (heads)', b.mortality], ['Vaccinations', b.vaccinations],
          ]),
          { title: 'Feeds, medicine, and vitamins used', columns: ['Item', 'Quantity'], rows: b.usage.map((u) => [u.name, `${u.qty} ${u.unit}`]) },
        ];
      }
      if (kind === 'sales') {
        const s = await api.get(`/reports/sales/${dept}?month=${month}`);
        if (isHog) return [{ title: 'Hog sales per batch', columns: ['Batch', 'Live weight (kg)', 'Income'], rows: s.rows.map((r) => [`#${r.batch_id}`, r.kilos, peso(r.income)]) }];
        const tot = s.rows.reduce((a, r) => ({ kilos: a.kilos + r.kilos, total: a.total + r.total, cogs: a.cogs + r.cogs }), { kilos: 0, total: 0, cogs: 0 });
        return [{
          title: `${dept} sales summary - ${month}`,
          columns: ['Product', 'Transactions', 'Kilos', 'Sales', 'Cost of goods'],
          rows: [...s.rows.map((r) => [r.product, r.transactions, r.kilos, peso(r.total), peso(r.cogs)]), ['TOTAL', '', tot.kilos, peso(tot.total), peso(tot.cogs)]],
        }];
      }
      // expenses
      const e = await api.get(`/reports/expenses/${dept}?month=${month}`);
      const out = [{ title: `${dept} expenses by category - ${month}`, columns: ['Category', 'Total'],
        rows: [...e.byCategory.map((c) => [c.category, peso(c.total)]), ['TOTAL', peso(e.byCategory.reduce((a, c) => a + c.total, 0))]] }];
      if (isHog) out.push({ title: 'Expenses per batch', columns: ['Batch', 'Category', 'Total'], rows: e.byBatch.map((r) => [`#${r.batch_id}`, r.category, peso(r.total)]) });
      return out;
    };
    build().then(setSections).catch((e) => setMsg(e.message));
  }, [dept, kind, month, batchId]);

  const title = `${dept} ${kind} report ${isHog && kind === 'monthly' ? `batch ${batchId}` : month}`;
  const exportAs = (format) => downloadFile('/reports/export', { format, title, sections }, `${title.replace(/\s+/g, '-')}.${format === 'pdf' ? 'pdf' : 'xlsx'}`)
    .catch((e) => setMsg(e.message));

  return (
    <>
      <PageHeader title="Reports" subtitle="Monthly, sales, expense, and per-batch reports.">
        <div className="no-print">
          <button className="btn-ghost" onClick={() => window.print()}>Print</button>{' '}
          <button className="btn-ghost" disabled={!sections.length} onClick={() => exportAs('pdf')}>Export PDF</button>{' '}
          <button className="btn-primary" disabled={!sections.length} onClick={() => exportAs('xlsx')}>Export Excel</button>
        </div>
      </PageHeader>
      {msg && <div className="toast" onAnimationEnd={() => setMsg('')}>{msg}</div>}

      <DeptTabs value={dept} onChange={(next) => { setDept(next); setBatchId(''); }} options={[["gulayan","Gulayan"],["prutasan","Prutasan"],["babuyan","Babuyan"]]} />
      <div className="tabs no-print">
        {[['monthly', isHog ? 'Batch report' : 'Monthly report'], ['sales', 'Sales summary'], ['expenses', 'Expense summary']].map(([k, label]) => (
          <button key={k} className={`tab small ${kind === k ? 'active' : ''}`} onClick={() => setKind(k)}>{label}</button>
        ))}
      </div>

      <div className="card report-sheet">
        <h2>{title}</h2>
        <div className="no-print" style={{ marginBottom: 16 }}>
          {isHog && kind === 'monthly' ? (
            <select value={batchId} onChange={(e) => setBatchId(e.target.value)} style={{ maxWidth: 260 }}>
              <option value="">Choose batch</option>
              {batches.map((b) => <option key={b.id} value={b.id}>Batch #{b.id}</option>)}
            </select>
          ) : !(isHog && kind === 'sales') && (
            <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} style={{ maxWidth: 220 }} />
          )}
        </div>

        {sections.length === 0 && <div className="empty-state">{isHog && kind === 'monthly' ? 'Choose a batch to see the report.' : 'Loading...'}</div>}
        {sections.map((sec) => (
          <div key={sec.title} style={{ marginBottom: 24 }}>
            <h3>{sec.title}</h3>
            <DataTable
              empty="No records for this selection."
              columns={sec.columns.map((c, i) => ({ key: String(i), label: c, render: (r) => r[i] }))}
              rows={sec.rows.map((r, i) => Object.assign([...r], { id: i }))}
            />
          </div>
        ))}
      </div>
    </>
  );
}
