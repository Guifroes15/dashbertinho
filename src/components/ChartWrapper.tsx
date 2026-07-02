import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, Cell } from 'recharts';

interface ChartContainerProps {
  title: string;
  children: React.ReactNode;
}

export function ChartContainer({ title, children }: ChartContainerProps) {
  return (
    <div className="bg-brand-medium border border-brand-light p-4 md:p-6 rounded-xl">
      <h3 className="text-sm md:text-md font-semibold mb-4 md:mb-6 text-gray-200">{title}</h3>
      <div className="h-[240px] md:h-[300px] w-full">
        {children}
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-brand-light border border-gray-800 p-3 rounded-lg shadow-xl">
        <p className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm font-semibold" style={{ color: entry.color || entry.fill }}>
            {entry.name}: {typeof entry.value === 'number' && entry.name.includes('%') ? entry.value.toFixed(2) + '%' : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export { CustomTooltip };
