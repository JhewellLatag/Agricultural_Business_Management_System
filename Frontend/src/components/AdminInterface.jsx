import React, { useState } from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import api from '../services/api';

// Department & Module Components
import GulayanInventory from './GulayanInventory';
import GulayanSales from './GulayanSales';
import PrutasanInventory from './PrutasanInventory';
import PrutasanSales from './PrutasanSales';
import AdminBabuyanStockIn from './AdminBabuyanStockIn';
import AdminBabuyanSales from './AdminBabuyanSales';
import AdminBabuyanBatches from './AdminBabuyanBatches';
import AdminBabuyanProfitability from './AdminBabuyanProfitability';
import BabuyanGrowthHealth from './BabuyanGrowthHealth';
import AdminExpenses from './AdminExpenses';
import AdminReportsScreen from './AdminReportsScreen';
import GulayanAnalytics from './GulayanAnalytics';
import PrutasanAnalytics from './PrutasanAnalytics';
import BabuyanAnalytics from './BabuyanAnalytics';
import AdminUserManagement from './AdminUserManagement';
import AdminAuditLogs from './AdminAuditLogs';

const AdminInterface = ({ user, onLogout }) => {
  const [activeModal, setActiveModal] = useState(null);

  // Quick Action 1: Add Stock State
  const [stockDept, setStockDept] = useState('Gulayan');
  const [stockCategory, setStockCategory] = useState('feeds');
  const [stockItemName, setStockItemName] = useState('');
  const [stockQty, setStockQty] = useState('');

  // Quick Action 2: Add Expense State
  const [expDept, setExpDept] = useState('Gulayan');
  const [expCategory, setExpCategory] = useState('sourcing');
  const [expBatchId, setExpBatchId] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expDesc, setExpDesc] = useState('');
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);

  // Quick Action 3: Add Livestock (with purchase date) State
  const [batchId, setBatchId] = useState('');
  const [batchName, setBatchName] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [numberOfHeads, setNumberOfHeads] = useState('');
  const [capitalCost, setCapitalCost] = useState('');

  const handleQuickAddStock = async (e) => {
    e.preventDefault();
    if (stockDept === 'Babuyan') {
      const unit = stockCategory === 'feeds' ? 'sacks' : 'bottles';
      await api.post('/babuyan/stock-in', {
        category: stockCategory,
        item_name: stockItemName,
        unit,
        quantity: stockQty,
      });
    } else if (stockDept === 'Gulayan') {
      await api.post('/gulayan/inventory', {
        item_name: stockItemName,
        kilos: stockQty,
      });
    } else if (stockDept === 'Prutasan') {
      await api.post('/prutasan/inventory', {
        item_name: stockItemName,
        kilos: stockQty,
      });
    }
    setStockItemName('');
    setStockQty('');
    setActiveModal(null);
  };

  const handleQuickAddExpense = async (e) => {
    e.preventDefault();
    const endpointMap = {
      Gulayan: '/gulayan/expenses',
      Prutasan: '/prutasan/expenses',
      Babuyan: '/babuyan/expenses',
    };
    const payload = {
      category: expCategory,
      amount: expAmount,
      description: expDesc,
      expense_date: expDate,
    };
    if (expDept === 'Babuyan' && expBatchId) {
      payload.batch_id = expBatchId;
    }
    await api.post(endpointMap[expDept], payload);
    setExpAmount('');
    setExpDesc('');
    setExpBatchId('');
    setActiveModal(null);
  };

  const handleQuickAddLivestock = async (e) => {
    e.preventDefault();
    await api.post('/babuyan/batches', {
      batch_id: batchId,
      batch_name: batchName,
      purchase_date: purchaseDate,
      number_of_heads: numberOfHeads,
      capital_cost: capitalCost,
    });
    setBatchId('');
    setBatchName('');
    setPurchaseDate(new Date().toISOString().split('T')[0]);
    setNumberOfHeads('');
    setCapitalCost('');
    setActiveModal(null);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* SIDEBAR FULL MENU (NO DASHBOARD) */}
      <aside style={{ width: '260px', backgroundColor: '#1e293b', color: '#f8fafc', padding: '16px' }}>
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '18px' }}>Farm Admin Menu</h2>
          <small>{user?.full_name} ({user?.role})</small>
        </div>

        {/* GULAYAN MENU */}
        <div style={{ marginBottom: '14px' }}>
          <strong>Gulayan</strong>
          <ul style={{ listStyle: 'none', paddingLeft: '12px', marginTop: '6px' }}>
            <li><Link to="/admin/gulayan/inventory" style={{ color: '#cbd5e1' }}>Inventory</Link></li>
            <li><Link to="/admin/gulayan/sales" style={{ color: '#cbd5e1' }}>Sales</Link></li>
            <li><Link to="/admin/gulayan/expenses" style={{ color: '#cbd5e1' }}>Expenses</Link></li>
          </ul>
        </div>

        {/* PRUTASAN MENU */}
        <div style={{ marginBottom: '14px' }}>
          <strong>Prutasan</strong>
          <ul style={{ listStyle: 'none', paddingLeft: '12px', marginTop: '6px' }}>
            <li><Link to="/admin/prutasan/inventory" style={{ color: '#cbd5e1' }}>Inventory</Link></li>
            <li><Link to="/admin/prutasan/sales" style={{ color: '#cbd5e1' }}>Sales</Link></li>
            <li><Link to="/admin/prutasan/expenses" style={{ color: '#cbd5e1' }}>Expenses</Link></li>
          </ul>
        </div>

        {/* BABUYAN MENU */}
        <div style={{ marginBottom: '14px' }}>
          <strong>Babuyan</strong>
          <ul style={{ listStyle: 'none', paddingLeft: '12px', marginTop: '6px' }}>
            <li><Link to="/admin/babuyan/inventory" style={{ color: '#cbd5e1' }}>Inventory</Link></li>
            <li><Link to="/admin/babuyan/sales" style={{ color: '#cbd5e1' }}>Sales</Link></li>
            <li><Link to="/admin/babuyan/expenses" style={{ color: '#cbd5e1' }}>Expenses</Link></li>
            <li><Link to="/admin/babuyan/livestock" style={{ color: '#cbd5e1' }}>Livestock</Link></li>
            <li><Link to="/admin/babuyan/growth-health" style={{ color: '#cbd5e1' }}>Growth &amp; Health</Link></li>
            <li><Link to="/admin/babuyan/profitability" style={{ color: '#cbd5e1' }}>Profitability</Link></li>
          </ul>
        </div>

        {/* 4.6 ANALYTICS MENU (SEPARATE PER DEPARTMENT) */}
        <div style={{ marginBottom: '14px' }}>
          <strong>Analytics</strong>
          <ul style={{ listStyle: 'none', paddingLeft: '12px', marginTop: '6px' }}>
            <li><Link to="/admin/analytics/gulayan" style={{ color: '#cbd5e1' }}>Gulayan Analytics</Link></li>
            <li><Link to="/admin/analytics/prutasan" style={{ color: '#cbd5e1' }}>Prutasan Analytics</Link></li>
            <li><Link to="/admin/analytics/babuyan" style={{ color: '#cbd5e1' }}>Babuyan Analytics</Link></li>
          </ul>
        </div>

        {/* SYSTEM-WIDE ADMIN MENUS */}
        <div style={{ marginBottom: '14px' }}>
          <strong>Management</strong>
          <ul style={{ listStyle: 'none', paddingLeft: '12px', marginTop: '6px' }}>
            <li><Link to="/admin/reports" style={{ color: '#cbd5e1' }}>Reports</Link></li>
            <li><Link to="/admin/users" style={{ color: '#cbd5e1' }}>User Access Management</Link></li>
            <li><Link to="/admin/audit-logs" style={{ color: '#cbd5e1' }}>Activity &amp; Audit Logs</Link></li>
          </ul>
        </div>

        <button type="button" onClick={onLogout} style={{ marginTop: '16px', width: '100%', padding: '8px' }}>
          Logout
        </button>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{ backgroundColor: '#f1f5f9', padding: '12px 20px', borderBottom: '1px solid #cbd5e1', display: 'flex', gap: '10px' }}>
          <button type="button" onClick={() => setActiveModal('stock')}>
            + Add Stock
          </button>
          <button type="button" onClick={() => setActiveModal('expense')}>
            + Add Expense
          </button>
          <button type="button" onClick={() => setActiveModal('livestock')}>
            + Add Livestock
          </button>
        </header>

        {activeModal === 'stock' && (
          <div style={{ backgroundColor: '#fff', border: '1px solid #94a3b8', padding: '16px', margin: '16px 20px 0' }}>
            <h3>Quick Action: Add Stock</h3>
            <form onSubmit={handleQuickAddStock}>
              <select value={stockDept} onChange={(e) => setStockDept(e.target.value)}>
                <option value="Gulayan">Gulayan</option>
                <option value="Prutasan">Prutasan</option>
                <option value="Babuyan">Babuyan</option>
              </select>
              {stockDept === 'Babuyan' && (
                <select value={stockCategory} onChange={(e) => setStockCategory(e.target.value)}>
                  <option value="feeds">Feeds (sacks)</option>
                  <option value="medicine">Medicine (bottles)</option>
                  <option value="vitamins">Vitamins (bottles)</option>
                </select>
              )}
              <input
                type="text"
                placeholder="Item Name"
                value={stockItemName}
                onChange={(e) => setStockItemName(e.target.value)}
                required
              />
              <input
                type="number"
                step="0.01"
                placeholder={stockDept === 'Babuyan' ? 'Quantity (sacks/bottles)' : 'Kilos'}
                value={stockQty}
                onChange={(e) => setStockQty(e.target.value)}
                required
              />
              <button type="submit">Save Stock</button>
              <button type="button" onClick={() => setActiveModal(null)}>Close</button>
            </form>
          </div>
        )}

        {activeModal === 'expense' && (
          <div style={{ backgroundColor: '#fff', border: '1px solid #94a3b8', padding: '16px', margin: '16px 20px 0' }}>
            <h3>Quick Action: Add Expense</h3>
            <form onSubmit={handleQuickAddExpense}>
              <select
                value={expDept}
                onChange={(e) => {
                  const dept = e.target.value;
                  setExpDept(dept);
                  setExpCategory(dept === 'Babuyan' ? 'feed' : 'sourcing');
                }}
              >
                <option value="Gulayan">Gulayan</option>
                <option value="Prutasan">Prutasan</option>
                <option value="Babuyan">Babuyan</option>
              </select>
              <select value={expCategory} onChange={(e) => setExpCategory(e.target.value)}>
                {(expDept === 'Babuyan'
                  ? ['feed', 'veterinary care', 'labor', 'utilities']
                  : ['sourcing', 'storage', 'logistics', 'labor']
                ).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {expDept === 'Babuyan' && (
                <input
                  type="text"
                  placeholder="Batch ID (Optional)"
                  value={expBatchId}
                  onChange={(e) => setExpBatchId(e.target.value)}
                />
              )}
              <input
                type="number"
                step="0.01"
                placeholder="Amount"
                value={expAmount}
                onChange={(e) => setExpAmount(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Description"
                value={expDesc}
                onChange={(e) => setExpDesc(e.target.value)}
              />
              <input
                type="date"
                value={expDate}
                onChange={(e) => setExpDate(e.target.value)}
                required
              />
              <button type="submit">Save Expense</button>
              <button type="button" onClick={() => setActiveModal(null)}>Close</button>
            </form>
          </div>
        )}

        {activeModal === 'livestock' && (
          <div style={{ backgroundColor: '#fff', border: '1px solid #94a3b8', padding: '16px', margin: '16px 20px 0' }}>
            <h3>Quick Action: Add Livestock (with Purchase Date)</h3>
            <form onSubmit={handleQuickAddLivestock}>
              <input
                type="text"
                placeholder="Batch ID (e.g., BATCH-01)"
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Batch Label (Optional)"
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
              />
              <label>Purchase Date: </label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                required
              />
              <input
                type="number"
                min="1"
                placeholder="Number of Heads"
                value={numberOfHeads}
                onChange={(e) => setNumberOfHeads(e.target.value)}
                required
              />
              <input
                type="number"
                step="0.01"
                placeholder="Capital Cost"
                value={capitalCost}
                onChange={(e) => setCapitalCost(e.target.value)}
                required
              />
              <button type="submit">Add Livestock</button>
              <button type="button" onClick={() => setActiveModal(null)}>Close</button>
            </form>
          </div>
        )}

        {/* DIRECT MODULE ROUTES */}
        <main style={{ padding: '20px', flex: 1 }}>
          <Routes>
            <Route index element={<Navigate to="/admin/gulayan/inventory" replace />} />

            {/* Gulayan */}
            <Route path="gulayan/inventory" element={<GulayanInventory />} />
            <Route path="gulayan/sales" element={<GulayanSales />} />
            <Route path="gulayan/expenses" element={<AdminExpenses />} />

            {/* Prutasan */}
            <Route path="prutasan/inventory" element={<PrutasanInventory />} />
            <Route path="prutasan/sales" element={<PrutasanSales />} />
            <Route path="prutasan/expenses" element={<AdminExpenses />} />

            {/* Babuyan */}
            <Route path="babuyan/inventory" element={<AdminBabuyanStockIn />} />
            <Route path="babuyan/sales" element={<AdminBabuyanSales />} />
            <Route path="babuyan/expenses" element={<AdminExpenses />} />
            <Route path="babuyan/livestock" element={<AdminBabuyanBatches />} />
            <Route path="babuyan/growth-health" element={<BabuyanGrowthHealth />} />
            <Route path="babuyan/profitability" element={<AdminBabuyanProfitability />} />

            {/* Separate Department Analytics Pages (4.6) */}
            <Route path="analytics/gulayan" element={<GulayanAnalytics />} />
            <Route path="analytics/prutasan" element={<PrutasanAnalytics />} />
            <Route path="analytics/babuyan" element={<BabuyanAnalytics />} />

            {/* Shared Reports, User Access Management, Activity & Audit Logs */}
            <Route path="reports" element={<AdminReportsScreen />} />
            <Route path="users" element={<AdminUserManagement />} />
            <Route path="audit-logs" element={<AdminAuditLogs />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminInterface;