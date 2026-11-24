// WBS 4.3.3–4.3.5 — Staff Interfaces
// Assigned Member(s): Jhewell Latag
// NOTE: Shared modules are labeled with all applicable WBS responsibilities.
// StaffLayout.jsx - sariling layout ng bawat staff (4.3.3 - 4.3.5)
//   Gulayan  : taas na menu, banner sa kaliwa
//   Prutasan : taas na menu, naka-gitna ang banner at tabs
//   Babuyan  : menu sa kaliwang gilid
// Ang hitsura ng bawat isa ay nasa styles/staff.css
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import '../styles/staff.css';

// Ito lang ang makikita ng staff. Walang cost o profit.
const STAFF_MENU = {
  gulayan: [{ to: '/gulayan/sales', text: 'Sales (POS)' }, { to: '/gulayan/inventory', text: 'Inventory' }],
  prutasan: [{ to: '/prutasan/sales', text: 'Sales (POS)' }, { to: '/prutasan/inventory', text: 'Inventory' }],
  babuyan: [{ to: '/babuyan/inventory', text: 'Feeds, medicine & vitamins', short: 'Inventory' }, { to: '/babuyan/usage', text: 'Record release', short: 'Release' }],
};
const TAGLINE = {
  gulayan: 'Fresh vegetables, sold per kilo.',
  prutasan: 'Sweet fruits, sold per kilo.',
  babuyan: 'Keep every release matched with stock.',
};

export default function GulayanStaffInterface() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const dept = 'gulayan';

  return (
    <div className={`staff-shell staff-${dept}`} data-theme={dept}>
      <header className="staff-top">
        <div className="staff-brand">
          <span className="brand-mark">{dept.charAt(0).toUpperCase()}</span>
          <div>
            <strong>{dept}</strong>
            <small>{user.name}</small>
          </div>
        </div>
        <nav className="staff-nav">
          {STAFF_MENU[dept].map((l) => (
            <NavLink key={l.to} to={l.to} className="staff-link">
              <span className="lbl-long">{l.text}</span><span className="lbl-short">{l.short || l.text}</span>
            </NavLink>
          ))}
        </nav>
        <button className="staff-logout" onClick={logout}>Log out</button>
      </header>

      <section className="staff-banner">
        <h2>{dept}</h2>
        <p>{TAGLINE[dept]}</p>
      </section>

      <main className="staff-main" key={pathname}>
        <Outlet />
      </main>
    </div>
  );
}
