import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  change?: {
    value: string;
    isPositive: boolean;
  };
  icon?: LucideIcon;
}

export function StatCard({ label, value, subtext, change, icon: Icon }: StatCardProps) {
  return (
    <div className="bg-brand-medium border border-brand-light p-4 md:p-6 rounded-xl hover:border-brand-purple transition-all duration-200 group">
      <div className="flex justify-between items-start mb-2 md:mb-4">
        <span className="text-[10px] md:text-sm text-[var(--text-secondary)] font-medium uppercase tracking-wider md:normal-case md:tracking-normal">{label}</span>
        {Icon && <Icon className="w-4 h-4 md:w-5 md:h-5 text-brand-purple opacity-50 group-hover:opacity-100 transition-opacity" />}
      </div>
      <div className="text-xl md:text-3xl font-bold mb-1 text-[var(--text-primary)]">{value}</div>
      {subtext && <div className="text-[10px] md:text-xs text-[var(--text-muted)] font-medium">{subtext}</div>}
      {change && (
        <div className={`text-xs mt-2 font-semibold ${change.isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {change.isPositive ? '↑' : '↓'} {change.value}
        </div>
      )}
    </div>
  );
}
