import React from 'react';
import { Calendar, ChevronRight } from 'lucide-react';

interface Props {
  allMonths: string[];
  monthLabels: string[];
  selected: Set<string>;
  onChange: (selected: Set<string>) => void;
}

export function MonthFilter({ allMonths, monthLabels, selected, onChange }: Props) {
  const selectAll = () => onChange(new Set(allMonths));
  const selectLastN = (n: number) => {
    const lastN = allMonths.slice(-n);
    onChange(new Set(lastN));
  };
  const selectSingle = (chave: string) => {
    onChange(new Set([chave]));
  };

  const toggle = (chave: string) => {
    const next = new Set(selected);
    if (next.has(chave)) {
      if (next.size > 1) next.delete(chave);
    } else {
      next.add(chave);
    }
    onChange(next);
  };

  const isSelected = (chave: string) => selected.has(chave);
  const isPeriod = (n: number) => {
    if (selected.size !== n) return false;
    const lastN = allMonths.slice(-n);
    return lastN.every(m => selected.has(m));
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
      {/* Atalhos Rápidos */}
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-2 mr-2">
          <Calendar className="w-3 h-3 text-brand-purple" />
          <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Período:</span>
        </div>
        
        {[
          { label: 'Último Mês', action: () => selectLastN(1), active: selected.size === 1 && isSelected(allMonths[allMonths.length - 1]) },
          { label: '3 Meses', action: () => selectLastN(3), active: isPeriod(3) },
          { label: '6 Meses', action: () => selectLastN(6), active: isPeriod(6) },
          { label: 'Tudo', action: selectAll, active: selected.size === allMonths.length },
        ].map(preset => (
          <button
            key={preset.label}
            onClick={preset.action}
            className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${
              preset.active 
                ? 'bg-brand-purple border-brand-purple text-white shadow-lg shadow-brand-purple/20' 
                : 'bg-brand-light border-brand-light text-[var(--text-secondary)] hover:border-[var(--text-muted)]'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Timeline Horizontal */}
      <div className="relative group">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar mask-fade-right">
          {allMonths.map((chave, i) => {
            const active = isSelected(chave);
            const label = monthLabels[i].split('/')[0]; // Ex: "Jan" de "Jan/24"
            const year = monthLabels[i].split('/')[1];
            
            return (
              <button
                key={chave}
                onClick={() => toggle(chave)}
                className={`flex flex-col items-center min-w-[50px] py-2 rounded-xl transition-all border ${
                  active
                    ? 'bg-brand-purple border-brand-purple text-white'
                    : 'bg-brand-medium border-brand-light text-[var(--text-secondary)] hover:border-[var(--text-muted)] hover:bg-brand-light/40'
                }`}
              >
                <span className="text-[10px] font-black uppercase tracking-tighter">{label}</span>
                <span className={`text-[8px] opacity-50 font-bold ${active ? 'text-white' : 'text-[var(--text-muted)]'}`}>{year}</span>
              </button>
            );
          })}
          
          <div className="min-w-[40px] flex items-center justify-center opacity-20 group-hover:opacity-100 transition-opacity">
            <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
          </div>
        </div>
      </div>
    </div>
  );
}
