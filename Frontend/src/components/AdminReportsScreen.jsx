import React, { useState, useEffect } from 'react';
import api from '../services/api';
import BabuyanBatchReports from './BabuyanBatchReports';

const AdminReportsScreen = () => {
  const [selectedReport, setSelectedReport] = useState('Gulayan'); // 'Gulayan' | 'Prutasan' | 'Babuyan'
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDepartmentReport = async () => {
      if (selectedReport === 'Babuyan') return;
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/reports/department', {
          params: { department: selectedReport, month },
        });
        setReportData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load department report.');
        setReportData(null);
      } finally {
        setLoading(false);
      }
    };

    loadDepartmentReport();
  }, [selectedReport, month]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    try {
      const res = await api.post(
        '/reports/export/pdf',
        { department: selectedReport, month },
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', ${selectedReport}_Report_${month}.pdf);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to export PDF report.');
    }
  };

  const handleExportExcel = async () => {
    try {
      const res = await api.post(
        '/reports/export/excel',
        { department: selectedReport, month },
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', ${selectedReport}_Report_${month}.xlsx);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to export Excel report.');
    }
  };

  const metrics = reportData?.summaryMetrics || {};

  return (
    <div>
      <h2>Admin - Shared Reports &amp; Export Center</h2>

      {error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '10px', marginBottom: '12px' }}>
          {error}
        </div>
      )}

      {/* Report Selector Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
        <button
          type="button"
          onClick={() => setSelectedReport('Gulayan')}
          style={{ fontWeight: selectedReport === 'Gulayan' ? 'bold' : 'normal' }}
        >
          Gulayan Monthly &amp; Summary Report
        </button>
        <button
          type="button"
          onClick={() => setSelectedReport('Prutasan')}
          style={{ fontWeight: selectedReport === 'Prutasan' ? 'bold' : 'normal' }}
        >
          Prutasan Monthly &amp; Summary Report
        </button>
        <button
          type="button"
          onClick={() => setSelectedReport('Babuyan')}
          style={{ fontWeight: selectedReport === 'Babuyan' ? 'bold' : 'normal' }}
        >
          Babuyan Per-Batch Report
        </button>
      </div>

      {selectedReport === 'Babuyan' ? (
        <BabuyanBatchReports />
      ) : (
        <div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <label>Select Month: </label>
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              />
            </div>

            <button type="button" onClick={handlePrint}>
              Print Report
            </button>
            <button type="button" onClick={handleExportPDF}>
              Export PDF
            </button>
            <button type="button" onClick={handleExportExcel}>
              Export Excel
            </button>
          </div>

          {loading ? (
            <p>Loading report data...</p>
          ) : (
            reportData && (
              <div style={{ border: '1px solid #ccc', padding: '16px' }}>
                <h3>
                  {reportData.reportTitle} ({reportData.period})
                </h3>

                <h4>Financial &amp; Volume Summary</h4>
                <table>
                  <thead>
                    <tr>
                      <th>Total Kilos Sold</th>
                      <th>Total Sales</th>
                      <th>Total Expenses</th>
                      <th>Spoilage Loss</th>
                      <th>Net Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{Number(metrics.total_kilos_sold || 0)} kg</td>
                      <td>{Number(metrics.total_sales || 0).toFixed(2)}</td>
                      <td>{Number(metrics.total_expenses || 0).toFixed(2)}</td>
                      <td>{Number(metrics.spoilage_loss || 0).toFixed(2)}</td>
                      <td>
                        <strong
                          style={{
                            color: Number(metrics.net_profit || 0) >= 0 ? 'green' : 'red',
                          }}
                        >
                          {Number(metrics.net_profit || 0).toFixed(2)}
                        </strong>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <h4>{selectedReport} Sales Summary</h4>
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Item</th>
                      <th>Kilos</th>
                      <th>Price / kg</th>
                      <th>Total Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(reportData.salesRecords || []).map((s) => (
                      <tr key={s.id}>
                        <td>{s.sale_date}</td>
                        <td>{s.item_name}</td>
                        <td>{s.kilos} kg</td>
                        <td>{s.price_per_kilo}</td>
                        <td>{Number(s.total_amount || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <h4>{selectedReport} Expense Summary</h4>
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Category</th>
                      <th>Description</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(reportData.expenseRecords || []).map((e) => (
                      <tr key={e.id}>
                        <td>{e.expense_date}</td>
                        <td>{e.category}</td>
                        <td>{e.description || '-'}</td>
                        <td>{Number(e.amount || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default AdminReportsScreen;