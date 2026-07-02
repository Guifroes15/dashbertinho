// SimuladorView.tsx — Simulador de Investimento Extra
import React, { useState, useMemo } from 'react';
import { StoreData } from '../../types';
import { formatBRL } from '../../utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts';
import { Plus, Minus, TrendingUp, AlertTriangle, MessageSquare, DollarSign } from 'lucide-react';
import { ChartTooltip } from '../ui/ChartCard';

interface Props { store: StoreData; fee: number }

// Calcula custo por mensagem do histórico (verba ÷ mensagens)
function calcCustoXMsg(store: StoreData): number {
  const meses = store.historico.filter(m => m.mensagens > 0 && m.verba > 0);
  if (!meses.length) return 0;
  return meses.reduce((a, m) => a + m.verba / m.mensagens, 0) / meses.length;
}

// Calcula R$ de venda por mensagem do histórico
function calcVendaXMsg(store: StoreData): number {
  const meses = store.historico.filter(m => m.mensagens > 0 && m.vendas > 0);
  if (!meses.length) return 0;
  return meses.reduce((a, m) => a + m.vendas / m.mensagens, 0) / meses.length;
}

// Ticket médio histórico
function calcTicket(store: StoreData): number {
  const meses = store.historico.filter(m => m.ticketMedio > 0);
  if (!meses.length) return 0;
  return meses.reduce((a, m) => a + m.ticketMedio, 0) / meses.length;
}

// Conversão média histórica
function calcConvMedia(store: StoreData): number {
  const meses = store.historico.filter(m => m.conversao > 0);
  if (!meses.length) return 0;
  return meses.reduce((a, m) => a + m.conversao, 0) / meses.length;
}

// Média de verba mensal histórica
function calcVerbaMedia(store: StoreData): number {
  const meses = store.historico.filter(m => m.verba > 0);
  if (!meses.length) return 0;
  return meses.reduce((a, m) => a + m.verba, 0) / meses.length;
}

// Média de mensagens mensal histórica
function calcMsgsMedia(store: StoreData): number {
  const meses = store.historico.filter(m => m.mensagens > 0);
  if (!meses.length) return 0;
  return meses.reduce((a, m) => a + m.mensagens, 0) / meses.length;
}

export function SimuladorView({ store, fee }: Props) {
  const [investimentoExtra, setInvestimentoExtra] = useState(300);

  const custoXMsg   = useMemo(() => calcCustoXMsg(store),   [store]);
  const vendaXMsg   = useMemo(() => calcVendaXMsg(store),   [store]);
  const ticket      = useMemo(() => calcTicket(store),      [store]);
  const convMedia   = useMemo(() => calcConvMedia(store),   [store]);
  const verbaMedia  = useMemo(() => calcVerbaMedia(store),  [store]);
  const msgsMedia   = useMemo(() => calcMsgsMedia(store),   [store]);

  const hasMsgs = msgsMedia > 0;
  const hasConv = convMedia > 0 && ticket > 0;

  // Mensagens extras que o investimento extra compra
  const msgsExtras = custoXMsg > 0
    ? Math.round(investimentoExtra / custoXMsg)
    : 0;

  // Mensagens totais projetadas = histórico + extras
  const msgsProjetadas = Math.round(msgsMedia + msgsExtras);

  // Vendas projetadas base (com verba atual, sem extra)
  const vendasBase = hasMsgs
    ? hasConv
      ? msgsMedia * (convMedia / 100) * ticket
      : msgsMedia * vendaXMsg
    : store.historico.filter(m => m.vendas > 0).slice(-3).reduce((a, m) => a + m.vendas, 0) / 3 || 0;

  // Vendas projetadas com investimento extra
  const vendasComExtra = hasMsgs
    ? hasConv
      ? msgsProjetadas * (convMedia / 100) * ticket
      : msgsProjetadas * vendaXMsg
    : vendasBase; // sem dados de msgs, não consegue projetar diferença

  const ganhoVendas = vendasComExtra - vendasBase;

  // ROI projetado (com extra)
  const custoBase  = fee + verbaMedia;
  const custoExtra = fee + verbaMedia + investimentoExtra;
  const roiBase    = vendasBase    - custoBase;
  const roiExtra   = vendasComExtra - custoExtra;
  const roiDiff    = roiExtra - roiBase;

  // Qtd vendas extras estimadas
  const qtdExtras = ticket > 0 ? Math.round(ganhoVendas / ticket) : 0;

  // Cenários para o gráfico
  const cenarioData = [
    { label: 'Pessimista', vendas: Math.round(vendasComExtra * 0.7), roi: Math.round(vendasComExtra * 0.7 - custoExtra) },
    { label: 'Base',       vendas: Math.round(vendasComExtra),       roi: Math.round(roiExtra) },
    { label: 'Otimista',   vendas: Math.round(vendasComExtra * 1.3), roi: Math.round(vendasComExtra * 1.3 - custoExtra) },
  ];

  // Histórico para o gráfico comparativo
  const historicData = store.historico
    .filter(m => m.vendas > 0)
    .slice(-4)
    .map(m => ({ name: m.mes, vendas: m.vendas, tipo: 'hist' }));

  const chartData = [
    ...historicData,
    { name: 'Sem extra', vendas: Math.round(vendasBase),     tipo: 'base'  },
    { name: 'Com extra', vendas: Math.round(vendasComExtra), tipo: 'extra' },
  ];

  const valorInvestimentoRapido = [100, 200, 300, 500, 1000];

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="bg-brand-medium border border-brand-light rounded-xl p-4">
        <p className="text-xs font-bold text-[var(--text-primary)] mb-1">Simulador de Investimento Extra</p>
        <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">
          Quanto a mais você quer investir em mídia este mês?
          O sistema calcula quantas mensagens a mais isso gera e quanto de vendas extras projetar,
          baseado no histórico real desta loja.
        </p>
      </div>

      {/* Input principal */}
      <div className="bg-brand-medium border border-brand-light rounded-xl p-5">
        <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-4">
          Investimento extra em mídia
        </p>

        {/* Seleção rápida */}
        <div className="flex flex-wrap gap-2 mb-4">
          {valorInvestimentoRapido.map(v => (
            <button
              key={v}
              onClick={() => setInvestimentoExtra(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                investimentoExtra === v
                  ? 'bg-brand-purple border-brand-purple text-white'
                  : 'border-brand-light text-gray-500 hover:text-gray-300 hover:border-gray-600'
              }`}
            >
              + R$ {v}
            </button>
          ))}
        </div>

        {/* Input manual */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setInvestimentoExtra(v => Math.max(0, v - 50))}
            className="w-9 h-9 rounded-lg bg-brand-light border border-brand-light flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-600 transition-all"
          >
            <Minus className="w-4 h-4" />
          </button>
          <div className="flex-1 flex items-center bg-brand-dark border border-brand-light rounded-lg overflow-hidden focus-within:border-brand-purple transition-colors">
            <span className="px-3 text-xs text-[var(--text-muted)] border-r border-brand-light">R$</span>
            <input
              type="number"
              value={investimentoExtra || ''}
              onChange={e => setInvestimentoExtra(Math.max(0, Number(e.target.value) || 0))}
              className="flex-1 bg-transparent px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none font-bold"
              min={0}
              step={50}
            />
            <span className="px-3 text-xs text-[var(--text-muted)] border-l border-brand-light">extra/mês</span>
          </div>
          <button
            onClick={() => setInvestimentoExtra(v => v + 50)}
            className="w-9 h-9 rounded-lg bg-brand-light border border-brand-light flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-600 transition-all"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Referências históricas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
          {custoXMsg > 0 && (
            <div className="bg-brand-dark rounded-lg p-2.5 text-center">
              <p className="text-[8px] text-[var(--text-muted)] uppercase mb-1">Custo/msg histórico</p>
              <p className="text-xs font-bold text-[var(--text-primary)]">{formatBRL(custoXMsg)}</p>
            </div>
          )}
          {msgsMedia > 0 && (
            <div className="bg-brand-dark rounded-lg p-2.5 text-center">
              <p className="text-[8px] text-[var(--text-muted)] uppercase mb-1">Msgs/mês histórico</p>
              <p className="text-xs font-bold text-[var(--text-primary)]">{Math.round(msgsMedia)}</p>
            </div>
          )}
          {convMedia > 0 && (
            <div className="bg-brand-dark rounded-lg p-2.5 text-center">
              <p className="text-[8px] text-[var(--text-muted)] uppercase mb-1">Conv. média</p>
              <p className="text-xs font-bold text-[var(--text-primary)]">{convMedia.toFixed(1)}%</p>
            </div>
          )}
          {ticket > 0 && (
            <div className="bg-brand-dark rounded-lg p-2.5 text-center">
              <p className="text-[8px] text-[var(--text-muted)] uppercase mb-1">Ticket médio</p>
              <p className="text-xs font-bold text-[var(--text-primary)]">{formatBRL(ticket)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Resultado do investimento extra */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

        {/* Mensagens extras */}
        {hasMsgs && custoXMsg > 0 && (
          <div className="bg-brand-medium border border-brand-light rounded-xl p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <MessageSquare className="w-3.5 h-3.5 text-brand-purple" />
              <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Mensagens extras</p>
            </div>
            <p className="text-2xl font-bold text-[var(--text-primary)] mb-0.5">+{msgsExtras}</p>
            <p className="text-[10px] text-[var(--text-muted)]">
              de {Math.round(msgsMedia)} → {msgsProjetadas} msgs no total
            </p>
          </div>
        )}

        {/* Vendas extras projetadas */}
        <div className={`bg-brand-medium border rounded-xl p-4 ${ganhoVendas > 0 ? 'border-green-900/40' : 'border-brand-light'}`}>
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingUp className="w-3.5 h-3.5 text-green-500" />
            <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Vendas extras</p>
          </div>
          <p className="text-2xl font-bold text-green-400 mb-0.5">+{formatBRL(ganhoVendas)}</p>
          {qtdExtras > 0 && (
            <p className="text-[10px] text-[var(--text-muted)]">~{qtdExtras} vendas a mais estimadas</p>
          )}
          {!hasMsgs && (
            <p className="text-[9px] text-gray-700 italic">Sem histórico de msgs para calcular</p>
          )}
        </div>

        {/* Impacto no ROI */}
        <div className={`bg-brand-medium border rounded-xl p-4 ${roiDiff >= 0 ? 'border-green-900/40' : 'border-red-900/40'}`}>
          <div className="flex items-center gap-1.5 mb-2">
            <DollarSign className="w-3.5 h-3.5" style={{ color: roiDiff >= 0 ? '#22c55e' : '#ef4444' }} />
            <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Impacto no ROI</p>
          </div>
          <p className="text-2xl font-bold mb-0.5" style={{ color: roiDiff >= 0 ? '#22c55e' : '#ef4444' }}>
            {roiDiff >= 0 ? '+' : ''}{formatBRL(roiDiff)}
          </p>
          <p className="text-[10px] text-[var(--text-muted)]">
            ROI com extra: <span className="font-bold" style={{ color: roiExtra >= 0 ? '#22c55e' : '#ef4444' }}>{formatBRL(roiExtra)}</span>
          </p>
        </div>
      </div>

      {/* Comparativo base vs extra */}
      <div className="bg-brand-medium border border-brand-light rounded-xl p-4">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
          Comparativo — sem extra vs. com extra
        </p>
        <p className="text-[9px] text-gray-700 mb-4">
          Últimos 4 meses reais + projeção sem investimento extra + projeção com + R$ {investimentoExtra.toLocaleString('pt-BR')}
        </p>
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 12, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e28" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 9 }} dy={5} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 9 }} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<ChartTooltip />} />
              <ReferenceLine y={custoExtra} stroke="#7c3aed" strokeDasharray="4 4" strokeWidth={1} />
              <Bar dataKey="vendas" radius={[4, 4, 0, 0]}>
                {chartData.map((d, i) => (
                  <Cell
                    key={i}
                    fill={d.tipo === 'extra' ? '#22c55e' : d.tipo === 'base' ? '#6b7280' : store.color}
                    fillOpacity={d.tipo === 'base' ? 0.6 : 0.85}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-4 mt-2 justify-center flex-wrap">
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm" style={{ background: store.color }} /><span className="text-[9px] text-gray-600">Histórico</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-gray-500" /><span className="text-[9px] text-gray-600">Projeção sem extra</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-green-500" /><span className="text-[9px] text-gray-600">Projeção com extra</span></div>
          <div className="flex items-center gap-1.5"><div className="w-6 h-px bg-brand-purple border-dashed border" /><span className="text-[9px] text-gray-600">Custo total c/ extra</span></div>
        </div>
      </div>

      {/* Cenários */}
      <div className="bg-brand-medium border border-brand-light rounded-xl p-4">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Cenários com o investimento extra</p>
        <div className="grid grid-cols-3 gap-3">
          {cenarioData.map((c, i) => {
            const isBase = i === 1;
            const roiPos = c.roi >= 0;
            return (
              <div key={i} className="rounded-lg p-3 text-center border" style={{
                background: isBase ? 'rgba(124,58,237,.08)' : 'transparent',
                borderColor: isBase ? 'rgba(124,58,237,.3)' : 'rgba(255,255,255,.05)',
              }}>
                <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider mb-2">{c.label}</p>
                <p className="text-sm font-bold text-[var(--text-primary)] mb-1">{formatBRL(c.vendas)}</p>
                <p className="text-xs font-bold" style={{ color: roiPos ? '#22c55e' : '#ef4444' }}>
                  ROI: {formatBRL(c.roi)}
                </p>
                <p className={`text-[8px] mt-1 ${roiPos ? 'text-green-800' : 'text-red-900'}`}>
                  {roiPos ? '✓ Operação paga' : '✗ No negativo'}
                </p>
              </div>
            );
          })}
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-2.5 rounded-lg bg-black/20 border border-brand-light/20">
            <p className="text-[8px] font-bold text-gray-500 uppercase mb-1">Pessimista (70%)</p>
            <p className="text-[9px] text-gray-700 leading-tight">Considera que fatores externos ou sazonalidade negativa reduzam a eficiência histórica em 30%.</p>
          </div>
          <div className="p-2.5 rounded-lg bg-brand-purple/5 border border-brand-purple/20">
            <p className="text-[8px] font-bold text-brand-purple2 uppercase mb-1">Base (100%)</p>
            <p className="text-[9px] text-gray-700 leading-tight">Projeção direta baseada exatamente na média de conversão e ticket médio dos últimos meses.</p>
          </div>
          <div className="p-2.5 rounded-lg bg-black/20 border border-brand-light/20">
            <p className="text-[8px] font-bold text-gray-500 uppercase mb-1">Otimista (130%)</p>
            <p className="text-[9px] text-gray-700 leading-tight">Cenário onde a campanha performa 30% acima da média, seja por alta conversão ou ticket elevado.</p>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 p-3 rounded-lg border border-amber-900/30 bg-amber-950/10">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
        <p className="text-[9px] text-amber-900 leading-relaxed">
          Projeções baseadas no histórico real desta loja. Resultados variam conforme sazonalidade,
          qualidade dos criativos e segmentação. Use como referência de planejamento.
        </p>
      </div>
    </div>
  );
}
