import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

const DEFAULT_COLORS = ['#16a34a', '#2563eb', '#d97706', '#dc2626', '#7c3aed', '#64748b'];

// 1. Reusable Bar Chart Component (supports single/multiple bars & stacked comparison)
export const SharedBarChart = ({ title, data, xKey, bars = [], height = 300 }) => (
  <div style={{ marginBottom: '24px' }}>
    {title && <h3>{title}</h3>}
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} />
          <YAxis />
          <Tooltip />
          <Legend />
          {bars.map((bar, index) => (
            <Bar
              key={bar.dataKey}
              dataKey={bar.dataKey}
              name={bar.name || bar.dataKey}
              stackId={bar.stackId}
              fill={bar.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

// 2. Reusable Line Chart Component (for spoilage trends & profit trends)
export const SharedLineChart = ({ title, data, xKey, lines = [], height = 300 }) => (
  <div style={{ marginBottom: '24px' }}>
    {title && <h3>{title}</h3>}
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} />
          <YAxis />
          <Tooltip />
          <Legend />
          {lines.map((line, index) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              name={line.name || line.dataKey}
              stroke={line.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
              strokeWidth={2}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);

// 3. Reusable Pie Chart Component (for expense share by category)
export const SharedPieChart = ({ title, data, dataKey, nameKey, height = 300 }) => (
  <div style={{ marginBottom: '24px' }}>
    {title && <h3>{title}</h3>}
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey={dataKey}
            nameKey={nameKey}
            cx="50%"
            cy="50%"
            outerRadius={100}
            label={(entry) => `${entry[nameKey]} (${entry.percentage ?? entry[dataKey]}%)`}
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </div>
);