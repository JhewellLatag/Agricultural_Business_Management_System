// Charts.jsx - reusable na graphs para sa Analytics (gamit ang recharts)
// Kung gusto ninyong palitan ang itsura ng graphs, dito lang.
import {
  ResponsiveContainer, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import '../styles/analytics.css';

// Palette ng pie chart (shades na bagay sa theme)
const PIE_COLORS = ['#14935f', '#ea7414', '#d63a5c', '#4263eb', '#e9b500', '#7a4fd1'];

// galing MySQL ang SUM bilang text, kaya gawing number
const clean = (items = []) => items.map((i) => ({ ...i, value: Number(i.value) }));

const tooltipStyle = { borderRadius: 14, border: '1px solid #e3e8e4', boxShadow: '0 18px 40px -16px rgba(16,32,24,0.35)', padding: '10px 14px', fontWeight: 600, fontFamily: 'Hanken Grotesk, sans-serif' };
const AXIS = { fontSize: 12, fill: '#667a70' };
const noLine = { stroke: 'none' };

// gradient para sa bars/area; id ay galing sa kulay
const gid = (c, k = 'v') => `g${k}${c.replace('#', '')}`;
const Grad = ({ color, kind = 'v', vertical = true, from = 1, to = 0.55 }) => (
  <linearGradient id={gid(color, kind)} x1="0" y1="0" x2={vertical ? 0 : 1} y2={vertical ? 1 : 0}>
    <stop offset="0%" stopColor={color} stopOpacity={from} />
    <stop offset="100%" stopColor={color} stopOpacity={to} />
  </linearGradient>
);
const Empty = () => <div className="empty-state">No data yet.</div>;

// Bar graph. horizontal = true para pahiga ang bars (maganda sa mahahabang pangalan)
export function SimpleBar({ data, color, format = (v) => v, horizontal = false }) {
  const rows = clean(data);
  if (!rows.length) return <Empty />;

  return (
    <ResponsiveContainer width="100%" height={Math.max(240, horizontal ? rows.length * 52 : 240)}>
      <BarChart data={rows} layout={horizontal ? 'vertical' : 'horizontal'} margin={{ left: 8, right: 16 }}>
        <defs><Grad color={color} kind={horizontal ? 'h' : 'v'} vertical={!horizontal} from={horizontal ? 0.55 : 1} to={horizontal ? 1 : 0.5} /></defs>
        <CartesianGrid strokeDasharray="2 6" stroke="#d5ddd8" horizontal={!horizontal} vertical={horizontal} />
        {horizontal ? (
          <>
            <XAxis type="number" tick={AXIS} axisLine={noLine} tickLine={noLine} />
            <YAxis type="category" dataKey="label" width={95} tick={AXIS} axisLine={noLine} tickLine={noLine} />
          </>
        ) : (
          <>
            <XAxis dataKey="label" tick={AXIS} axisLine={{ stroke: '#d5ddd8' }} tickLine={noLine} />
            <YAxis tick={AXIS} axisLine={noLine} tickLine={noLine} />
          </>
        )}
        <Tooltip formatter={(v) => format(v)} contentStyle={tooltipStyle} cursor={{ fill: 'rgba(16,32,24,0.05)', radius: 8 }} />
        <Bar dataKey="value" name="Value" fill={`url(#${gid(color, horizontal ? 'h' : 'v')})`} radius={horizontal ? [0, 8, 8, 0] : [8, 8, 0, 0]} maxBarSize={44} animationDuration={900} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Line graph - para sa trends (spoilage, profit)
export function SimpleLine({ data, color, format = (v) => v }) {
  const rows = clean(data);
  if (!rows.length) return <Empty />;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={rows} margin={{ left: 8, right: 16, top: 10 }}>
        <defs><Grad color={color} kind="a" from={0.32} to={0} /></defs>
        <CartesianGrid strokeDasharray="2 6" stroke="#d5ddd8" vertical={false} />
        <XAxis dataKey="label" tick={AXIS} axisLine={{ stroke: '#d5ddd8' }} tickLine={noLine} />
        <YAxis tick={AXIS} axisLine={noLine} tickLine={noLine} />
        <Tooltip formatter={(v) => format(v)} contentStyle={tooltipStyle} />
        <Area type="monotone" dataKey="value" name="Value" stroke={color} strokeWidth={3} fill={`url(#${gid(color, 'a')})`}
          dot={{ r: 4, fill: '#fff', stroke: color, strokeWidth: 2.5 }} activeDot={{ r: 7, fill: color, stroke: '#fff', strokeWidth: 3 }} animationDuration={1100} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// Pie / donut graph - para sa expense share
export function SimplePie({ data, format = (v) => v }) {
  const rows = clean(data);
  if (!rows.length) return <Empty />;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie data={rows} dataKey="value" nameKey="label" innerRadius={68} outerRadius={108} cornerRadius={6} stroke="#fff" strokeWidth={3}
          paddingAngle={2} animationDuration={1000}>
          {rows.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
        </Pie>
        <Tooltip formatter={(v) => format(v)} contentStyle={tooltipStyle} />
        <Legend iconType="circle" iconSize={9} />
      </PieChart>
    </ResponsiveContainer>
  );
}

// Magkatabing bars (hal. total cost vs net profit ng bawat batch)
// series = [{ key, name, color }]
export function GroupedBar({ data, series, format = (v) => v }) {
  if (!data?.length) return <Empty />;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ left: 8, right: 16 }}>
        <CartesianGrid strokeDasharray="2 6" stroke="#d5ddd8" vertical={false} />
        <XAxis dataKey="label" tick={AXIS} axisLine={{ stroke: '#d5ddd8' }} tickLine={noLine} />
        <YAxis tick={AXIS} axisLine={noLine} tickLine={noLine} />
        <Tooltip formatter={(v) => format(v)} contentStyle={tooltipStyle} cursor={{ fill: 'rgba(16,32,24,0.05)', radius: 8 }} />
        <Legend iconType="circle" iconSize={9} />
        {series.map((s) => (
          <Bar key={s.key} dataKey={s.key} name={s.name} fill={s.color} radius={[8, 8, 0, 0]} maxBarSize={36} animationDuration={900} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
