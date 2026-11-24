// Layout.jsx - Admin: sidebar na may buong menu. Staff: sarili nilang layout (StaffLayout).
// Sa phone at tablet, ang sidebar ay nagiging drawer na bubuksan ng hamburger button.
import { useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import StaffLayout from './StaffLayout.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import '../styles/layout.css';

export default function AdminInterface() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  // Ang mga pinagsamang page (Inventory, Expenses, Analytics) ay nagsasabi kung anong kulay ang gagamitin
  const [themeOverride, setThemeOverride] = useState(null); // { path, theme }
  const setTheme = useCallback((theme) => setThemeOverride({ path: pathname, theme }), [pathname]);

  // magsasara ang drawer pagkalipat ng page
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  // habang bukas ang drawer: hindi gagalaw ang likod, at Esc para isara
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [menuOpen]);

  if (user.role !== 'admin') return <StaffLayout />;

  // unang parte ng URL = department (hal. /gulayan/sales), para magbago ang kulay
  const dept = themeOverride?.path === pathname ? themeOverride.theme : pathname.split('/')[1];

  return (
    <div className="app-shell" data-theme={dept}>
      {/* Top bar na lalabas lang sa phone/tablet */}
      <header className="mobile-bar no-print">
        <button className="menu-btn" aria-label="Open menu" onClick={() => setMenuOpen(true)}>☰</button>
        <strong>Agri Business</strong>
      </header>

      {menuOpen && <div className="scrim no-print" onClick={() => setMenuOpen(false)} />}
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* key={pathname} para mag-replay ang animation kada lipat ng page */}
      <main className="main-area" key={pathname}>
        <Outlet context={{ setTheme }} />
      </main>
    </div>
  );
}
