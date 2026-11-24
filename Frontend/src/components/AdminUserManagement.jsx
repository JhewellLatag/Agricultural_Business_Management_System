// WBS 4.3.1 — Account Management UI
// Assigned Member(s): Jhewell Latag
// NOTE: Shared modules are labeled with all applicable WBS responsibilities.
// Users.jsx - accounts, roles, edit, at password reset (4.3.1, Admin only)
import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import PageHeader from './PageHeader.jsx';
import DataTable from './DataTable.jsx';
import '../styles/forms.css';

const ROLES = ['admin', 'gulayan', 'prutasan', 'babuyan'];

export default function AdminUserManagement() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [msg, setMsg] = useState('');
  const blank = { name: '', username: '', password: '', role: 'gulayan' };
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null); // { id, name, role, active, password }

  const load = () => api.get('/users').then(setUsers);
  useEffect(() => { load(); }, []);

  const run = async (fn, after) => {
    try { const r = await fn(); setMsg(r.message); after?.(); load(); } catch (e) { setMsg(e.message); }
  };

  return (
    <>
      <PageHeader title="User access" subtitle="Create accounts and assign a department and role." />
      {msg && <div className="toast" onAnimationEnd={() => setMsg('')}>{msg}</div>}

      <form className="card sale-form" onSubmit={(e) => { e.preventDefault(); run(() => api.post('/users', form), () => setForm(blank)); }}>
        <h3>Create account</h3>
        <div className="row">
          <input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            {ROLES.map((r) => <option key={r}>{r}</option>)}
          </select>
          <button className="btn-primary">Create</button>
        </div>
      </form>

      <div className="card">
        <DataTable
          rows={users}
          columns={[
            { key: 'name', label: 'Name', render: (u) => editing?.id === u.id
              ? <input style={{ margin: 0 }} value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /> : u.name },
            { key: 'username', label: 'Username' },
            { key: 'role', label: 'Role', render: (u) => editing?.id === u.id ? (
              <select style={{ margin: 0, width: 130 }} value={editing.role} onChange={(e) => setEditing({ ...editing, role: e.target.value })}>
                {ROLES.map((r) => <option key={r}>{r}</option>)}
              </select>
            ) : u.role },
            { key: 'password', label: 'New password', render: (u) => editing?.id === u.id && (
              <input style={{ margin: 0 }} type="password" placeholder="Leave blank to keep" value={editing.password} onChange={(e) => setEditing({ ...editing, password: e.target.value })} />
            ) },
            { key: 'active', label: 'Status', render: (u) => (
              <button className={u.active ? 'btn-ghost' : 'btn-danger small'} disabled={u.id === me.id}
                onClick={() => run(() => api.put(`/users/${u.id}`, { ...u, active: !u.active }))}>
                {u.active ? 'Active' : 'Deactivated'}
              </button>
            ) },
            { key: 'actions', label: '', render: (u) => editing?.id === u.id ? (
              <div className="row-actions">
                <button className="btn-ghost" onClick={() => run(() => api.put(`/users/${u.id}`, { ...editing, active: u.active }), () => setEditing(null))}>Save</button>
                <button className="btn-link" onClick={() => setEditing(null)}>Cancel</button>
              </div>
            ) : <button className="btn-ghost" onClick={() => setEditing({ id: u.id, name: u.name, role: u.role, password: '' })}>Edit</button> },
          ]}
        />
      </div>
    </>
  );
}
