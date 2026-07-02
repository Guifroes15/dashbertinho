import React, { useState, useMemo } from 'react';
import { RankingItem, formatBRL, calcRanking } from '../../utils';
import { StoreData } from '../../types';
import { Zap, Volume2, TrendingUp, AlertTriangle, Info, Ghost } from 'lucide-react';

const Q = {
  eficiente: {
    label: 'Eficiente',
    desc: 'Envia poucas mensagens e converte bem. Modelo ideal — escalar com cuidado.',
    badge: 'bg-green-500/15 text-green-400 border border-green-500/25',
    bar:   '#22c55e',
    Icon:  Zap,
  },
  volume: {
    label: 'Alto volume',
    desc: 'Envia muitas mensagens e converte bem. Estratégia escalável.',
    badge: 'bg-violet-500/15 text-violet-400 border border-violet-500/25',
    bar:   '#7c3aed',
    Icon:  Volume2,
  },
  potencial: {
    label: 'Potencial',
    desc: 'Envia poucas mensagens e converte pouco. Aumentar volume pode mudar o resultado.',
    badge: 'bg-amber-500/15 text-amber-400 border border-amber-500/25',
    bar:   '#f59e0b',
    Icon:  TrendingUp,
  },
  revisar: {
    label: 'Revisar',
    desc: 'Envia muitas mensagens mas converte pouco. Revisar segmentação e conteúdo.',
    badge: 'bg-red-500/15 text-red-400 border border-red-500/25',
    bar:   '#ef4444',
    Icon:  AlertTriangle,
  },
  'sem-dados': {
    label: 'Sem Disparos',
    desc: 'Loja sem registros de mensagens enviadas. Foco apenas em ROI de vendas.',
    badge: 'bg-gray-500/15 text-gray-400 border border-gray-500/25',
    bar:   '#6b7280',
    Icon:  Ghost,
  },
};

type QKey = keyof typeof Q;

function QuadrantTooltip({ qkey }: { qkey: QKey }) {
  const [show, setShow] = useState(false);
  const cfg = Q[qkey];
  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(v => !v)}
        className="ml-1.5 opacity-40 hover:opacity-80 transition-opacity"
      >
        <Info className="w-3.5 h-3.5 inline" style={{ color: cfg.bar }} />
      </button>
      {show && (
        <div className="absolute z-50 bottom-6 left-0 w-56 p-3 rounded-xl text-xs text-gray-300 leading-relaxed shadow-2xl"
          style={{ background: '#1a1a24', border: '1px solid #2a2a38' }}>
          {cfg.desc}
        </div>
      )}
    </div>
  );
}

interface QuadrantCardProps {
  qkey: QKey;
  items: RankingItem[];
  key?: string;
}

function QuadrantCard({ qkey, items }: QuadrantCardProps) {
  const cfg = Q[qkey];
  return (
    <div className="rounded-xl p-4 border" style={{ background: `${cfg.bar}0d`, borderColor: `${cfg.bar}30` }}>
      <div className="flex items-center gap-2 mb-3">
        <cfg.Icon className="w-3.5 h-3.5 shrink-0" style={{ color: cfg.bar }} />
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: cfg.bar }}>
          {cfg.label}
        </span>
        <QuadrantTooltip qkey={qkey} />
      </div>
      <p className="text-2xl font-bold text-[var(--text-primary)] mb-3">{items.length}</p>
      {items.length > 0 ? (
        <div className="space-y-1.5">
          {items.slice(0, 3).map(l => (
            <div key={l.storeId} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: l.color }} />
                <span className="text-[10px] text-gray-400 truncate">{l.storeName}</span>
              </div>
              <span className="text-[10px] font-bold shrink-0" style={{ color: cfg.bar }}>
                {l.quadrante === 'sem-dados' ? 'ROI Only' : `${formatBRL(l.eficiencia)}/msg`}
              </span>
            </div>
          ))}
          {items.length > 3 && (
            <p className="text-[9px] text-gray-600 text-right">+ {items.length - 3} lojas</p>
          )}
        </div>
      ) : (
        <p className="text-[10px] text-gray-700">Nenhuma loja</p>
      )}
    </div>
  );
}

function EficienciaBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-brand-light rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="text-xs font-bold w-16 text-right shrink-0" style={{ color }}>
        {value > 0 ? `${formatBRL(value)}/msg` : '—'}
      </span>
    </div>
  );
}

export function RankingView({ stores }: { stores: StoreData[] }) {
  const ranking = useMemo(() => calcRanking(stores), [stores]);
  
  const maxEfic = Math.max(...ranking.map(r => r.eficiencia));
  const comConversao = ranking.filter(r => r.conversao > 0);
  const mediaConv = comConversao.length ? comConversao.reduce((a, r) => a + r.conversao, 0) / comConversao.length : 0;

  const byQ: Record<QKey, RankingItem[]> = {
    eficiente:   ranking.filter(r => r.quadrante === 'eficiente'),
    volume:      ranking.filter(r => r.quadrante === 'volume'),
    potencial:   ranking.filter(r => r.quadrante === 'potencial'),
    revisar:     ranking.filter(r => r.quadrante === 'revisar'),
    'sem-dados': ranking.filter(r => r.quadrante === 'sem-dados'),
  };

  return (
    <div className="animate-in fade-in duration-500">
      <header className="mb-6">
        <h1 className="text-2xl lg:text-4xl font-extrabold tracking-tight mb-1 text-[var(--text-primary)]">
          Ranking de Eficiência
        </h1>
        <p className="text-xs lg:text-sm text-[var(--text-secondary)]">
          Análise comparativa de todas as lojas baseada no último mês com dados
        </p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
        {(Object.keys(Q) as QKey[]).map(q => (
          <QuadrantCard key={q} qkey={q} items={byQ[q]} />
        ))}
      </div>

      <div className="bg-brand-medium border border-brand-light rounded-xl overflow-hidden shadow-2xl">
        <div className="p-4 lg:p-6 border-b border-brand-light flex items-start justify-between gap-4 bg-white/[0.01]">
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Métricas de Performance Técnica</h3>
            <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
              R$ gerado por mensagem enviada · Média de conversão técnica: {mediaConv.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* MOBILE */}
        <div className="block lg:hidden divide-y divide-brand-light">
          {ranking.map((item, i) => {
            const cfg = Q[item.quadrante as QKey];
            const acimaDaMedia = item.conversao >= mediaConv;
            return (
              <div key={item.storeId} className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold text-[var(--text-muted)] w-5">#{i + 1}</span>
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color }} />
                  <span className="text-sm font-semibold text-[var(--text-primary)] flex-1">{item.storeName}</span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>
                    {cfg.label}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="bg-brand-light rounded-lg p-2 text-center border border-white/5">
                    <p className="text-[8px] text-[var(--text-muted)] mb-1 uppercase tracking-wider">Mensagens</p>
                    <p className="text-xs font-bold text-[var(--text-primary)]">{item.mensagens || '—'}</p>
                  </div>
                  <div className="bg-brand-light rounded-lg p-2 text-center border border-white/5">
                    <p className="text-[8px] text-[var(--text-muted)] mb-1 uppercase tracking-wider">Conversão</p>
                    <p className="text-xs font-bold" style={{ color: item.conversao > 0 ? (acimaDaMedia ? '#22c55e' : '#f59e0b') : '#666' }}>
                      {item.conversao > 0 ? `${item.conversao.toFixed(1)}%` : '—'}
                    </p>
                  </div>
                  <div className="bg-brand-light rounded-lg p-2 text-center border border-white/5">
                    <p className="text-[8px] text-[var(--text-muted)] mb-1 uppercase tracking-wider">Vendas</p>
                    <p className="text-xs font-bold text-[var(--text-primary)]">{formatBRL(item.vendas)}</p>
                  </div>
                </div>

                {item.quadrante !== 'sem-dados' && (
                  <div className="space-y-1">
                    <p className="text-[8px] text-[var(--text-muted)] uppercase tracking-wider">Eficiência (R$/msg)</p>
                    <EficienciaBar value={item.eficiencia} max={maxEfic} color={cfg.bar} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* DESKTOP */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-600 uppercase tracking-widest w-12">#</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-600 uppercase tracking-widest">Loja</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-600 uppercase tracking-widest text-center">Msgs</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-600 uppercase tracking-widest text-center">Conversão</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-600 uppercase tracking-widest text-right">Vendas</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-600 uppercase tracking-widest w-56">Eficiência</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-600 uppercase tracking-widest text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-light">
              {ranking.map((item, i) => {
                const cfg = Q[item.quadrante as QKey];
                const acimaDaMedia = item.conversao >= mediaConv;
                return (
                  <tr key={item.storeId} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4 text-xs font-bold text-gray-700">#{i + 1}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0 shadow-[0_0_8px_rgba(0,0,0,0.5)]" style={{ background: item.color }} />
                        <span className="text-sm font-semibold text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">{item.storeName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm text-gray-400 font-medium">{item.mensagens || '—'}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {item.conversao > 0 ? (
                        <div className="inline-flex items-center gap-1.5">
                          <span className="text-sm font-bold" style={{ color: acimaDaMedia ? '#22c55e' : '#f59e0b' }}>
                            {item.conversao.toFixed(1)}%
                          </span>
                          <span className="text-[10px] opacity-40">
                             {acimaDaMedia ? '↑' : '↓'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-600">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-bold text-[var(--text-primary)] tabular-nums">{formatBRL(item.vendas)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <EficienciaBar value={item.eficiencia} max={maxEfic} color={cfg.bar} />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${cfg.badge}`}>
                        {cfg.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="px-6 py-4 border-t border-brand-light flex flex-wrap gap-x-8 gap-y-2 items-center bg-white/[0.01]">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <p className="text-[10px] text-gray-600 font-medium">Acima da média técnica ({mediaConv.toFixed(1)}%)</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <p className="text-[10px] text-gray-600 font-medium">Abaixo da média técnica</p>
            </div>
            <div className="ml-auto text-[10px] text-gray-700 italic">
               Melhor performance técnica do grupo: {formatBRL(maxEfic)}/msg
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
