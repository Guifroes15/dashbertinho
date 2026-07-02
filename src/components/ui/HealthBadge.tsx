import React, { useState } from 'react';
import { calcHealthScore } from '../../utils';
import { StoreData } from '../../types';
import { Info } from 'lucide-react';

interface Props {
  store: StoreData;
  showDetails?: boolean;
}

export function HealthBadge({ store, showDetails = false }: Props) {
  const [open, setOpen] = useState(false);
  const health = calcHealthScore(store);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all"
        style={{ background: health.bg, color: health.color, border: `1px solid ${health.color}40` }}
      >
        <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: health.color }} />
        {health.label}
        <span className="font-normal opacity-70">{health.score}/100</span>
        <Info className="w-3 h-3 opacity-60" />
      </button>

      {open && (
        <div
          className="absolute z-50 top-8 left-0 w-64 rounded-xl p-4 shadow-2xl"
          style={{ background: '#14141a', border: '1px solid #2a2a38' }}
        >
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
            Como foi calculado
          </p>
          <div className="space-y-2">
            {health.detalhes.map((d, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">{d.criterio}</span>
                  <span className="text-white font-semibold">
                    {d.valor} — {d.pontos}/{d.maxPontos}pts
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-gray-800">
                  <div
                    className="h-1.5 rounded-full transition-all"
                    style={{
                      width: `${(d.pontos / d.maxPontos) * 100}%`,
                      background: health.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div
            className="mt-3 pt-3 flex justify-between items-center text-xs font-bold"
            style={{ borderTop: '1px solid #2a2a38' }}
          >
            <span className="text-gray-500">Score total</span>
            <span style={{ color: health.color }}>{health.score} / 100</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Versão compacta para tabelas/listas
export function HealthDot({ store }: { store: StoreData }) {
  const health = calcHealthScore(store);
  return (
    <span
      title={`${health.label} — ${health.score}/100`}
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold"
      style={{ background: health.bg, color: health.color }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: health.color }} />
      {health.label}
    </span>
  );
}
