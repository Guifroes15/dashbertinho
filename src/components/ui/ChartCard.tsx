import React from 'react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function ChartCard({ title, subtitle, children }: ChartCardProps) {
  return (
    <div className="bg-brand-medium border border-brand-light p-4 md:p-6 rounded-xl">
      <div className="mb-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">{title}</h3>
        {subtitle && <p className="text-[10px] text-gray-600 mt-0.5">{subtitle}</p>}
      </div>
      <div className="h-[240px] md:h-[300px] w-full">
        {children}
      </div>
    </div>
  );
}

export function ChartTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-brand-light border border-gray-800 p-3 rounded-lg shadow-xl">
        <p className="text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-widest">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 py-1">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: entry.color || entry.fill }} />
              <span className="text-[10px] font-medium text-gray-300">{entry.name}</span>
            </div>
            <span className="text-xs font-bold text-white">
              {typeof entry.value === 'number' 
                ? (entry.name.toLowerCase().includes('vendas') || entry.name.toLowerCase().includes('roi') 
                  ? entry.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                  : entry.value.toLocaleString('pt-BR'))
                : entry.value
              }
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}
