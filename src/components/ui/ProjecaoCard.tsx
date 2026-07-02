import React from 'react';
import { calcProjecao, formatBRL } from '../../utils';
import { StoreData } from '../../types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Props {
  store: StoreData;
}

export function ProjecaoCard({ store }: Props) {
  const proj = calcProjecao(store);

  const Icon = proj.tendencia === 'alta' ? TrendingUp
             : proj.tendencia === 'baixa' ? TrendingDown
             : Minus;

  const color = proj.tendencia === 'alta' ? '#22c55e'
              : proj.tendencia === 'baixa' ? '#ef4444'
              : '#9ca3af';

  const bg = proj.tendencia === 'alta' ? 'rgba(34,197,94,.08)'
           : proj.tendencia === 'baixa' ? 'rgba(239,68,68,.08)'
           : 'rgba(156,163,175,.08)';

  if (proj.baseadoEm === 0) {
    return (
      <div className="bg-brand-medium border border-brand-light rounded-xl p-5">
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Projeção {proj.label}</p>
        <p className="text-gray-600 text-sm">Dados insuficientes</p>
      </div>
    );
  }

  return (
    <div className="bg-brand-medium border border-brand-light rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-[var(--text-secondary)] uppercase tracking-widest mb-1">
            Projeção — {proj.label}
          </p>
          <p className="text-2xl font-bold text-[var(--text-primary)]">{formatBRL(proj.valor)}</p>
        </div>
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: bg }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full"
          style={{ background: bg, color }}
        >
          {proj.tendencia === 'alta' ? '↑' : proj.tendencia === 'baixa' ? '↓' : '→'}{' '}
          {Math.abs(proj.variacao).toFixed(1)}% em relação à média
        </span>
      </div>

      <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
        Média ponderada dos últimos {proj.baseadoEm} meses com vendas
      </p>
    </div>
  );
}
