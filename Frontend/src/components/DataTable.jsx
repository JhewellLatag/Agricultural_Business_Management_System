// DataTable.jsx - reusable table para sa lahat ng listahan
// Sa phone, nagiging cards ang bawat row (tingnan ang styles/responsive.css)
import '../styles/table.css';

// columns = [{ key, label, render? }]
export default function DataTable({ columns, rows, empty = 'Nothing here yet.' }) {
  if (!rows.length) return <div className="empty-state">{empty}</div>;

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>{columns.map((c) => <th key={c.key}>{c.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            // may delay kada row para sunod-sunod ang labas (animation)
            <tr key={row.id ?? i} style={{ animationDelay: `${i * 40}ms` }}>
              {/* data-label ang ginagamit ng CSS para ipakita ang pangalan ng column sa phone */}
              {columns.map((c) => <td key={c.key} data-label={c.label}>{c.render ? c.render(row) : row[c.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
