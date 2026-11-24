// WBS 3.1.3 — Livestock Production Cost and Profitability
// Assigned Member(s): Ivan Lanaria
// NOTE: Shared modules are labeled with all applicable WBS responsibilities.
const model = require('../models/profitServiceModel');
const money=n=>Math.round((Number(n)+Number.EPSILON)*100)/100;
async function batchProfit(batchId) {
  const [[batch]]=await model.findBatchById([batchId]);
  if (!batch) return null;
  const [[inc]]=await model.getBatchSalesTotals([batchId]);
  const [byCat]=await model.getBatchExpenseBreakdown([batchId]);
  const [used]=await model.getBatchUsageCosts([batchId]);
  const categoryCost=cat=>used.filter(r=>r.category===cat).reduce((s,r)=>s+Number(r.total),0);
  const expenses=byCat.reduce((s,r)=>s+Number(r.total),0);
  const feed=categoryCost('feed');
  const medicine=categoryCost('medicine')+categoryCost('vitamin');
  const other=expenses;
  const totalCost=money(Number(batch.capital_cost)+feed+medicine+other);
  return {batch,breakdown:byCat,usageBreakdown:used,capital:Number(batch.capital_cost),feed:money(feed),medicine:money(medicine),other:money(other),expenses:money(expenses),totalCost,income:money(inc.income),kilosSold:Number(inc.kilos),costPerKilo:Number(inc.kilos)>0?money(totalCost/Number(inc.kilos)):0,netProfit:money(Number(inc.income)-totalCost)};
}
async function monthlyReport(dept,month) {
  if (!['gulayan','prutasan'].includes(dept) || !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) throw new Error('Invalid department or month.');
  const like=`${month}%`;
  const [[s]]=await model.getMonthlySalesAndCogs([dept,like]);
  const [[e]]=await model.getMonthlyOperatingExpenses([dept,like]);
  const [[sp]]=await model.getMonthlySpoilageLoss([dept,like]);
  return {sales:money(s.sales),cogs:money(s.cogs),expenses:money(e.expenses),spoilageLoss:money(sp.loss),netProfit:money(Number(s.sales)-Number(s.cogs)-Number(e.expenses)-Number(sp.loss))};
}
module.exports={batchProfit,monthlyReport};
