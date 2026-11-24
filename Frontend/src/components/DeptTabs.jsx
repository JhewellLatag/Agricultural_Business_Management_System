// DeptTabs.jsx - tabs ng department; ang kulay ng tab ay ayon sa department
import '../styles/admin.css';
export default function DeptTabs({ value, onChange, options }) {
  return (
    <div className="dept-tabs no-print">
      {options.map(([key, label]) => (
        <button key={key} data-d={key} className={`dept-tab ${value === key ? 'active' : ''}`} onClick={() => onChange(key)}>{label}</button>
      ))}
    </div>
  );
}
