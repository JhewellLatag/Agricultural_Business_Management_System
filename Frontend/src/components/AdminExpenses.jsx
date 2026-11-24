// AdminExpenses.jsx - Expenses (VIEW ONLY) ng lahat ng department sa iisang page
import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import GulayanExpenses from './GulayanExpenses.jsx';
import PrutasanExpenses from './PrutasanExpenses.jsx';
import BabuyanExpenses from './BabuyanExpenses.jsx';
import DeptTabs from './DeptTabs.jsx';
import PageHeader from './PageHeader.jsx';

export default function AdminExpenses() {
  const [dept, setDept] = useState('gulayan');
  const { setTheme } = useOutletContext();
  useEffect(() => { setTheme(dept); }, [dept]);
  const Expenses = {gulayan: GulayanExpenses, prutasan: PrutasanExpenses, babuyan: BabuyanExpenses}[dept];
  return (
    <>
      <PageHeader title="Expenses" subtitle="View only." />
      <DeptTabs value={dept} onChange={setDept} options={[['gulayan', 'Gulayan'], ['prutasan', 'Prutasan'], ['babuyan', 'Babuyan']]} />
      <Expenses dept={dept} embedded />
    </>
  );
}
