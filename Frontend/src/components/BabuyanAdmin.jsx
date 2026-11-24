// BabuyanAdmin.jsx - ISANG Babuyan button sa Admin (pink). Wala na ang Usage dito;
// ang Record release ay para sa Babuyan staff na lang.
import { useState } from 'react';
import Inventory from './BabuyanInventory.jsx';
import Sales from './BabuyanSales.jsx';
import Livestock from './Livestock.jsx';
import DeptTabs from './DeptTabs.jsx';
import PageHeader from './PageHeader.jsx';

export default function BabuyanAdmin() {
  const [tab, setTab] = useState('inventory');
  return (
    <>
      <PageHeader title="Babuyan" subtitle="Inventory of feeds, medicines, and vitamins, hog sales, and livestock." />
      <DeptTabs value={tab} onChange={setTab} options={[['inventory', 'Inventory'], ['sales', 'Sales'], ['livestock', 'Livestock']]} />
      <div key={tab}>
        {tab === 'inventory' && <Inventory dept="babuyan" embedded />}
        {tab === 'sales' && <Sales dept="babuyan" embedded />}
        {tab === 'livestock' && <Livestock />}
      </div>
    </>
  );
}
