import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { SharedBarChart, SharedLineChart } from './SharedAnalyticsCharts';

const BabuyanAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      const res = await api.get('/analytics/babuyan');
      setAnalytics(res.data);
    };
    loadAnalytics();
  }, []);

  if (!analytics) return <div>Loading Babuyan Analytics...</div>;

  const { batchMetrics, profitTrend } = analytics;

  const costComparisonChartData = batchMetrics.map((b) => ({
    batch: b.batch_id,
    Capital: b.cost_comparison.capital_cost,
    Feed: b.cost_comparison.feed_cost,
    Medicine: b.cost_comparison.medicine_cost,
    Other: b.cost_comparison.other_expenses,
  }));

  return (
    <div>
      <h2>Babuyan Analytics</h2>

      <h3>Feed-to-Weight Ratio &amp; Cost per Kilo of Live Weight (Per Batch)</h3>
      <table>
        <thead>
          <tr>
            <th>Batch ID</th>
            <th>Batch Name</th>
            <th>Total Feed Used</th>
            <th>Live Weight (kg)</th>
            <th>Feed-to-Weight Ratio</th>
            <th>Total Cost</th>
            <th>Cost / kg Live Weight</th>
            <th>Revenue</th>
            <th>Net Profit</th>
          </tr>
        </thead>
        <tbody>
          {batchMetrics.map((b) => (
            <tr key={b.batch_id}>
              <td>{b.batch_id}</td>
              <td>{b.batch_name}</td>
              <td>{b.total_feed_units}</td>
              <td>{b.total_live_weight_kg} kg</td>
              <td><strong>{b.feed_to_weight_ratio}</strong></td>
              <td>{b.cost_comparison.total_cost.toFixed(2)}</td>
              <td><strong>{b.cost_per_kilo_live_weight.toFixed(2)} / kg</strong></td>
              <td>{b.total_revenue.toFixed(2)}</td>
              <td>
                <strong style={{ color: b.net_profit >= 0 ? 'green' : 'red' }}>
                  {b.net_profit.toFixed(2)}
                </strong>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Shared Bar Chart Component */}
      <SharedBarChart
        title="Cost Comparison Between Batches"
        data={costComparisonChartData}
        xKey="batch"
        bars={[
          { dataKey: 'Capital', stackId: 'a', color: '#4f46e5' },
          { dataKey: 'Feed', stackId: 'a', color: '#16a34a' },
          { dataKey: 'Medicine', stackId: 'a', color: '#d97706' },
          { dataKey: 'Other', stackId: 'a', color: '#64748b' },
        ]}
      />

      {/* Shared Line Chart Component */}
      <SharedLineChart
        title="Profit Trend (Selling & Herd Expansion Insights)"
        data={profitTrend}
        xKey="month"
        lines={[
          { dataKey: 'revenue', name: 'Revenue', color: '#16a34a' },
          { dataKey: 'expenses', name: 'Expenses', color: '#dc2626' },
          { dataKey: 'net_profit', name: 'Net Profit', color: '#2563eb' },
        ]}
      />
    </div>
  );
};

export default BabuyanAnalytics;