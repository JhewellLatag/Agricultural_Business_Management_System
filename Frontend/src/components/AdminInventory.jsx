// AdminInventory.jsx - ISANG Inventory button sa Admin: Gulayan at Prutasan magkasama.
// Pagpalit ng tab = nagbabago ang UI at kulay (green / orange). Kasama na rito ang Sales.
import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import GulayanInventory from './GulayanInventory.jsx';
import PrutasanInventory from './PrutasanInventory.jsx';
import BabuyanInventory from './BabuyanInventory.jsx';
import SalesHistory from './SalesHistory.jsx';
import DeptTabs from './DeptTabs.jsx';
import PageHeader from './PageHeader.jsx';

export default function AdminInventory() {
  const [dept, setDept] = useState('gulayan');
  const { setTheme } = useOutletContext();
  useEffect(() => { setTheme(dept); }, [dept]);

  const Inventory = {gulayan: GulayanInventory, prutasan: PrutasanInventory, babuyan: BabuyanInventory}[dept];
  return (
    <div key={dept}>
      <PageHeader title={`${dept} inventory`} subtitle="Stock and sales in one place.">
        <Link className="btn-ghost" to={`/${dept}/audit`}>Monthly audit</Link>
      </PageHeader>
      <DeptTabs value={dept} onChange={setDept} options={[['gulayan', 'Gulayan'], ['prutasan', 'Prutasan']]} />
      <Inventory dept={dept} embedded />
      <SalesHistory dept={dept} />
    </div>
  );
}
