// WBS 4.3.2–4.3.5 — Role-Based Page Routing
// Assigned Member(s): Jhewell Latag
// NOTE: Shared modules are labeled with all applicable WBS responsibilities.
// App.jsx - lahat ng pages at kung sino ang pwede pumasok (RBAC sa frontend)
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Login from './components/Login.jsx';
import Layout from './components/Layout.jsx';
import Inventory from './components/Inventory.jsx';
import Sales from './components/Sales.jsx';
import Expenses from './components/Expenses.jsx';
import Livestock from './components/Livestock.jsx';
import Audit from './components/Audit.jsx';
import Usage from './components/Usage.jsx';
import Reports from './components/Reports.jsx';
import Analytics from './components/Analytics.jsx';
import Users from './components/Users.jsx';
import ActivityLog from './components/ActivityLog.jsx';
import Pos from './components/Pos.jsx';
import AdminInventory from './components/AdminInventory.jsx';
import AdminExpenses from './components/AdminExpenses.jsx';
import BabuyanAdmin from './components/BabuyanAdmin.jsx';
import AnalyticsReports from './components/AnalyticsReports.jsx';

import GulayanInventory from './components/GulayanInventory.jsx';
import PrutasanInventory from './components/PrutasanInventory.jsx';
import BabuyanInventory from './components/BabuyanInventory.jsx';
function DepartmentInventory(props) { const params = useParams(); const dept = props.dept || params.dept; const Component = {gulayan: GulayanInventory, prutasan: PrutasanInventory, babuyan: BabuyanInventory}[dept]; return Component ? <Component {...props} /> : <Navigate to="/" replace />; }
import GulayanSales from './components/GulayanSales.jsx';
import PrutasanSales from './components/PrutasanSales.jsx';
import BabuyanSales from './components/BabuyanSales.jsx';
function DepartmentSales(props) { const params = useParams(); const dept = props.dept || params.dept; const Component = {gulayan: GulayanSales, prutasan: PrutasanSales, babuyan: BabuyanSales}[dept]; return Component ? <Component {...props} /> : <Navigate to="/" replace />; }
import GulayanExpenses from './components/GulayanExpenses.jsx';
import PrutasanExpenses from './components/PrutasanExpenses.jsx';
import BabuyanExpenses from './components/BabuyanExpenses.jsx';
function DepartmentExpenses(props) { const params = useParams(); const dept = props.dept || params.dept; const Component = {gulayan: GulayanExpenses, prutasan: PrutasanExpenses, babuyan: BabuyanExpenses}[dept]; return Component ? <Component {...props} /> : <Navigate to="/" replace />; }
import GulayanAnalytics from './components/GulayanAnalytics.jsx';
import PrutasanAnalytics from './components/PrutasanAnalytics.jsx';
import BabuyanAnalytics from './components/BabuyanAnalytics.jsx';
function DepartmentAnalytics(props) { const params = useParams(); const dept = props.dept || params.dept; const Component = {gulayan: GulayanAnalytics, prutasan: PrutasanAnalytics, babuyan: BabuyanAnalytics}[dept]; return Component ? <Component {...props} /> : <Navigate to="/" replace />; }

// Saan mapupunta ang user pagka-login. Walang dashboard, kaya diretso sa module.
const homeFor = (role) => (role === 'admin' ? '/inventory' : role === 'babuyan' ? '/babuyan/inventory' : `/${role}/sales`);

// Ano lang ang pwedeng buksan ng bawat staff
const STAFF_PAGES = {
  gulayan: ['sales', 'inventory'],
  prutasan: ['sales', 'inventory'],
  babuyan: ['inventory', 'usage'],
};

// Guard para sa mga page ng department. Admin = lahat. Staff = sarili nilang pages lang.
function Guard({ page, dept: fixedDept, children }) {
  const { user } = useAuth();
  const params = useParams();
  const dept = fixedDept || params.dept;
  const allowed = user.role === 'admin' || (user.role === dept && STAFF_PAGES[dept]?.includes(page));
  return allowed ? children : <Navigate to={homeFor(user.role)} replace />;
}

// Para sa Babuyan staff lang (Record release). Wala na ito sa Admin.
function BabuyanStaffOnly({ children }) {
  const { user } = useAuth();
  return user.role === 'babuyan' ? children : <Navigate to={homeFor(user.role)} replace />;
}

// Gulayan/Prutasan staff = POS. Admin = lumang sales form (Babuyan hog sales ay nasa Babuyan page).
function SalesPage() {
  const { user } = useAuth();
  return user.role === 'admin' ? <DepartmentSales /> : <Pos />;
}

// Guard para sa Admin-only na pages
function AdminOnly({ children }) {
  const { user } = useAuth();
  return user.role === 'admin' ? children : <Navigate to={homeFor(user.role)} replace />;
}

export default function App() {
  const { user } = useAuth();

  // Hindi pa naka-login -> login page lang
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Pinagsamang Admin pages */}
        <Route path="/inventory" element={<AdminOnly><AdminInventory /></AdminOnly>} />
        <Route path="/expenses" element={<AdminOnly><AdminExpenses /></AdminOnly>} />
        <Route path="/babuyan" element={<AdminOnly><BabuyanAdmin /></AdminOnly>} />
        <Route path="/analytics" element={<AdminOnly><AnalyticsReports /></AdminOnly>} />
        <Route path="/:dept/inventory" element={<Guard page="inventory"><DepartmentInventory /></Guard>} />
        <Route path="/:dept/sales" element={<Guard page="sales"><SalesPage /></Guard>} />
        <Route path="/:dept/expenses" element={<AdminOnly><DepartmentExpenses /></AdminOnly>} />
        <Route path="/:dept/audit" element={<AdminOnly><Audit /></AdminOnly>} />
        <Route path="/:dept/analytics" element={<AdminOnly><DepartmentAnalytics /></AdminOnly>} />
        <Route path="/babuyan/usage" element={<BabuyanStaffOnly><Usage /></BabuyanStaffOnly>} />
        <Route path="/babuyan/livestock" element={<AdminOnly><Livestock /></AdminOnly>} />
        <Route path="/reports" element={<Navigate to="/analytics" replace />} />
        <Route path="/users" element={<AdminOnly><Users /></AdminOnly>} />
        <Route path="/activity" element={<AdminOnly><ActivityLog /></AdminOnly>} />
      </Route>
      <Route path="*" element={<Navigate to={homeFor(user.role)} replace />} />
    </Routes>
  );
}
