// WBS 4.3.2–4.3.5 — Department Navigation
// Assigned Member(s): Jhewell Latag
// NOTE: Shared modules are labeled with all applicable WBS responsibilities.
// Sidebar.jsx - buong menu ng Admin (4.3.2)
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import '../styles/sidebar.css';
import '../styles/admin.css';

const label = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// Mga icon (SVG, sumusunod sa kulay ng text)
const Ico = ({ children }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
);
const ICONS = {
  inventory: <Ico><path d="M21 8l-9-5-9 5 9 5 9-5z" /><path d="M3 8v8l9 5 9-5V8" /><path d="M12 13v8" /></Ico>,
  expenses: <Ico><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z" /><path d="M9 8h6M9 12h6" /></Ico>,
  babuyan: <Ico><path d="M4 10c0-3 3-5 8-5s8 2 8 5v3c0 3-3 6-8 6s-8-3-8-6v-3z" /><path d="M5 6L4 3l4 2M19 6l1-3-4 2" /><circle cx="9.5" cy="10" r=".6" fill="currentColor" /><circle cx="14.5" cy="10" r=".6" fill="currentColor" /><path d="M10 14.5h4" /></Ico>,
  analytics: <Ico><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></Ico>,
  users: <Ico><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" /><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.3c2.2.7 3.5 2.6 3.5 5.7" /></Ico>,
  activity: <Ico><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></Ico>,
};

// Admin menu: isang button na lang kada grupo.
//  - Inventory = Gulayan + Prutasan (kasama na ang Sales)
//  - Expenses  = view only (galing sa Inventory ang record)
//  - Babuyan   = isang button; Analytics at Reports = isang button
const ADMIN_MENU = [
  { to: '/inventory', icon: 'inventory', text: 'Inventory' },
  { to: '/expenses', icon: 'expenses', text: 'Expenses', sub: '(View Only)' },
  { to: '/babuyan', icon: 'babuyan', text: 'Babuyan' },
  { to: '/analytics', icon: 'analytics', text: 'Analytics & Reports' },
  { to: '/users', icon: 'users', text: 'User access' },
  { to: '/activity', icon: 'activity', text: 'Activity log' },
];

export default function Sidebar({ open = false, onClose }) {
  const { user, logout } = useAuth();

  return (
    <aside className={`sidebar no-print ${open ? 'open' : ''}`}>
      <button className="close-btn" aria-label="Close menu" onClick={onClose}>×</button>
      <div className="brand">
        <span className="brand-mark">A</span>
        <div>
          <strong>Agri Business</strong>
          <small>{user.role === 'admin' ? 'Administrator' : label(user.role) + ' staff'}</small>
        </div>
      </div>

      <nav>
        {ADMIN_MENU.map((l) => (
          <NavLink key={l.to} to={l.to} className="nav-link">
            <span className="nav-ico">{ICONS[l.icon]}</span>{l.text}{l.sub && <span className="nav-sub">{l.sub}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="side-user">
        <span className="avatar">{(user.name || user.username || 'A').charAt(0)}</span>
        <div><strong>{user.name || user.username || 'Admin'}</strong><small>{user.role === 'admin' ? 'Full access' : label(user.role)}</small></div>
      </div>
      <button className="logout-btn" onClick={logout}>Log out</button>
    </aside>
  );
}
