// AnalyticsReports.jsx - ISANG button sa Admin: Analytics at Reports sa loob ng dalawang tab
import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import GulayanAnalytics from './GulayanAnalytics.jsx';
import PrutasanAnalytics from './PrutasanAnalytics.jsx';
import BabuyanAnalytics from './BabuyanAnalytics.jsx';
import Reports from './Reports.jsx';
import PageHeader from './PageHeader.jsx';
import DeptTabs from './DeptTabs.jsx';
import '../styles/premium-analytics.css';

export default function AnalyticsReports() {
  const [tab, setTab] = useState('analytics');
  const [dept, setDept] = useState('gulayan');
  const { setTheme } = useOutletContext();
  // green ang default; sumusunod sa kulay ng department kapag tiningnan ang detalye
  useEffect(() => { setTheme(tab === 'analytics' ? dept : 'gulayan'); }, [tab, dept]);

  const Analytics = {gulayan: GulayanAnalytics, prutasan: PrutasanAnalytics, babuyan: BabuyanAnalytics}[dept];
  return (
    <>
      {tab === 'analytics' && <PageHeader title="Analytics & Reports" subtitle="Business insights, performance analysis, and downloadable reports." />}
      <div className="tabs no-print">
        <button className={`tab ${tab === 'analytics' ? 'active' : ''}`} onClick={() => setTab('analytics')}>Analytics</button>
        <button className={`tab ${tab === 'reports' ? 'active' : ''}`} onClick={() => setTab('reports')}>Reports</button>
      </div>
      {tab === 'analytics' ? (
        <>
          <div className="premium-analytics-intro"><span>LIVE BUSINESS INTELLIGENCE</span><h2>Performance analytics</h2><p>Explore sales, trends, stock losses, and livestock profitability by department.</p></div>
          <DeptTabs value={dept} onChange={setDept} options={[['gulayan', 'Gulayan'], ['prutasan', 'Prutasan'], ['babuyan', 'Babuyan']]} />
          <Analytics dept={dept} embedded />
        </>
      ) : <Reports />}
    </>
  );
}
