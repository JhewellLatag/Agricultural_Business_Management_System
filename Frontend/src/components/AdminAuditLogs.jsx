// WBS 4.4.1 — Activity Log UI
// Assigned Member(s): Jhewell Latag
// NOTE: Shared modules are labeled with all applicable WBS responsibilities.
// ActivityLog.jsx - lahat ng galaw sa system (4.4.1, Admin only)
import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import PageHeader from './PageHeader.jsx';
import DataTable from './DataTable.jsx';
import '../styles/forms.css';

export default function AdminAuditLogs() {
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState({ user: '', dept: '', date: '' });

  // tuwing magbabago ang filter, kukunin ulit ang listahan
  useEffect(() => {
    const q = new URLSearchParams(filters).toString();
    api.get('/activity?' + q).then(setRows);
  }, [filters]);

  return (
    <>
      <PageHeader title="Activity log" subtitle="Who did what, and when." />
      <div className="card">
        <div className="filter-row">
          <input placeholder="Filter by user" value={filters.user} onChange={(e) => setFilters({ ...filters, user: e.target.value })} />
          <select value={filters.dept} onChange={(e) => setFilters({ ...filters, dept: e.target.value })}>
            <option value="">All departments</option>
            <option>gulayan</option><option>prutasan</option><option>babuyan</option>
          </select>
          <input type="date" value={filters.date} onChange={(e) => setFilters({ ...filters, date: e.target.value })} />
        </div>
        <DataTable
          empty="No activity found."
          rows={rows}
          columns={[
            { key: 'created_at', label: 'Time', render: (r) => new Date(r.created_at).toLocaleString() },
            { key: 'username', label: 'User' },
            { key: 'department', label: 'Department' },
            { key: 'action', label: 'Action' },
          ]}
        />
      </div>
    </>
  );
}
