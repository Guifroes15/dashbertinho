// StoreDetail.tsx — com filtro de meses e simulador
import React, { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { StoreData } from '../../types';
import { StatCard } from '../ui/StatCard';
import { ChartCard, ChartTooltip } from '../ui/ChartCard';
import { HealthBadge } from '../ui/HealthBadge';
import { ProjecaoCard } from '../ui/ProjecaoCard';
import { RoiPanel } from '../ui/RoiPanel';
import { MonthFilter } from '../ui/MonthFilter';
import { SimuladorView } from './SimuladorView';
import { DollarSign, Percent, MessageSquare, TrendingUp, BarChart2, Calculator, Info, Calendar, Target, RefreshCw, Eye, MousePointer, ThumbsUp, AlertCircle, Users } from 'lucide-react';
import { formatBRL, calcRoi, ultimoMes } from '../../utils';
import { useGestao } from '../../hooks/useGestao';
import { META_ACCOUNTS } from '../../config/metaAccounts';
import { DatePreset, MetaInsights, MetaDailyInsight, MetaCampaign, getAccountInsights, getAccountTimeSeries, getCampaigns } from '../../services/metaService';

interface Props {
  store: StoreData;
  fee: number;
  isMaster?: boolean;
  isStaff?: boolean;
  groupId?: string;
}
type Tab = 'visao' | 'simulador' | 'meta-ads';

const DATE_PRESETS: { label: string; value: DatePreset }[] = [
  { label: 'Últimos 7 dias',  value: 'last_7d'    },
  { label: 'Últimos 30 dias', value: 'last_30d'   },
  { label: 'Este mês',        value: 'this_month' },
  { label: 'Mês passado',     value: 'last_month' },
];
const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'text-green-400 bg-green-400/10', PAUSED: 'text-yellow-400 bg-yellow-400/10', ARCHIVED: 'text-gray-500 bg-gray-500/10',
};
const STATUS_LABELS: Record<string, string> = { ACTIVE: 'Ativo', PAUSED: 'Pausada', ARCHIVED: 'Arquivada' };
const fmtN = (n: number) => n.toLocaleString('pt-BR');

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 150,
      damping: 18,
    },
  },
};

export function StoreDetailView({ store, fee, isMaster = false, isStaff = false, groupId = '' }: Props) {
  const [tab, setTab] = useState<Tab>('visao');
  const [showFilter, setShowFilter] = useState(false);

  const adAccountId   = META_ACCOUNTS[store.id];
  const canSeeMetaAds = (isMaster || isStaff) && !!adAccountId;

  // Meta Ads state
  const [metaDatePreset, setMetaDatePreset] = useState<DatePreset>('last_30d');
  const [metaLoading, setMetaLoading]       = useState(false);
  const [metaError, setMetaError]           = useState<string | null>(null);
  const [metaInsights, setMetaInsights]     = useState<MetaInsights | null>(null);
  const [metaTimeSeries, setMetaTimeSeries] = useState<MetaDailyInsight[]>([]);
  const [metaCampaigns, setMetaCampaigns]   = useState<MetaCampaign[]>([]);

  const loadMeta = () => {
    if (!adAccountId) return;
    setMetaLoading(true);
    setMetaError(null);
    Promise.all([
      getAccountInsights(adAccountId, metaDatePreset),
      getAccountTimeSeries(adAccountId, metaDatePreset),
      getCampaigns(adAccountId, metaDatePreset),
    ])
      .then(([ins, ts, camps]) => {
        setMetaInsights(ins);
        setMetaTimeSeries(ts);
        setMetaCampaigns(camps.sort((a, b) => b.spend - a.spend));
      })
      .catch(err => setMetaError(err.message))
      .finally(() => setMetaLoading(false));
  };

  useEffect(() => { if (tab === 'meta-ads') loadMeta(); }, [tab, metaDatePreset, store.id]);

  const gestao = useGestao();
  const storeGestate = gestao.getLoja(groupId, store.id, store.name);
  const currentFeedback = storeGestate.feedback ?? '';

  // Filtro de meses
  const allChaves = store.historico.map(m => m.chave);
  const allLabels = store.historico.map(m => m.mes);
  const [selectedMonths, setSelectedMonths] = useState<Set<string>>(new Set(allChaves));

  // Sincroniza meses quando a loja muda
  React.useEffect(() => {
    setSelectedMonths(new Set(allChaves));
  }, [allChaves.join(',')]);

  // Dados filtrados
  const filtered = useMemo(
    () => store.historico.filter(m => selectedMonths.has(m.chave)),
    [store, selectedMonths]
  );

  const roi = calcRoi(store, fee);
  const comVendas = store.historico.filter(m => m.vendas > 0);
  const ultimo = ultimoMes(store);
  const penultimo = comVendas.length >= 2 ? comVendas[comVendas.length - 2] : null;

  const hasConversao   = store.historico.some(m => m.conversao > 0);
  const hasMensagens   = store.historico.some(m => m.mensagens > 0);
  const hasFaturamento = store.historico.some(m => m.faturamentoLoja > 0);
  const hasVerba       = store.historico.some(m => m.verba > 0);

  const change = (cur: number, prev: number | null) => {
    if (!prev || prev === 0) return undefined;
    const pct = ((cur - prev) / prev) * 100;
    return { value: `${Math.abs(pct).toFixed(1)}%`, isPositive: pct >= 0 };
  };

  // Gráficos usam dados filtrados
  const chartData = filtered.map(m => ({
    name: m.mes, vendas: m.vendas, conversao: m.conversao, mensagens: m.mensagens,
  }));

  // ROI filtrado
  const roiFiltered = useMemo(() => {
    const meses = filtered.map(m => {
      const custoTotal = fee + m.verba;
      const roiVal = m.vendas - custoTotal;
      return { mesLabel: m.mes, vendas: m.vendas, fee, verba: m.verba, custoTotal, roi: roiVal, roiPct: custoTotal > 0 ? ((m.vendas / custoTotal) - 1) * 100 : 0, positivo: roiVal >= 0 };
    });
    const totalVendas = meses.reduce((a, m) => a + m.vendas, 0);
    const totalFee    = fee * meses.length;
    const totalVerba  = meses.reduce((a, m) => a + m.verba, 0);
    const totalCusto  = totalFee + totalVerba;
    const roiTotal    = totalVendas - totalCusto;
    return { meses, totalVendas, totalFee, totalVerba, totalCusto, roiTotal, roiTotalPct: totalCusto > 0 ? ((totalVendas / totalCusto) - 1) * 100 : 0, mesesPositivos: meses.filter(m => m.positivo).length, mesesNegativos: meses.filter(m => !m.positivo).length, status: roiTotal > 0 ? 'positivo' : roiTotal < 0 ? 'negativo' : 'neutro' as any, temVerba: hasVerba };
  }, [filtered, fee, hasVerba]);

  // Loja com filtro para ROI (cria objeto fake com historico filtrado)
  const storeFiltered: StoreData = { ...store, historico: filtered };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-5"
    >

      {/* Header */}
      <motion.header variants={itemVariants} className="mb-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight mb-1" style={{ color: store.color }}>
              {store.name}
            </h1>
            <p className="text-xs text-gray-500">
              {store.historico[0].mes} — {store.historico[store.historico.length - 1].mes}
              {!hasFaturamento && <span className="ml-2 text-amber-700">· Sem faturamento da loja</span>}
              {!hasMensagens && <span className="ml-2 text-amber-700">· Sem dados de mensagens</span>}
            </p>
          </div>
          <div className="text-right shrink-0 hidden sm:block">
            <p className="text-[9px] text-gray-600 uppercase tracking-widest mb-1">ROI acumulado</p>
            <p className="text-xl font-bold" style={{ color: roi.status === 'positivo' ? '#22c55e' : '#ef4444' }}>
              {formatBRL(roi.roiTotal)}
            </p>
            <p className="text-[9px] text-gray-600">{roi.mesesPositivos}/{roi.meses.length} meses pagos</p>
          </div>
        </div>
        <HealthBadge store={store} />
        
        <div className="mt-3 p-3 rounded-xl bg-brand-medium border border-brand-light/50">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-3 h-3 text-brand-purple" />
            <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-tight">Entenda a classificação do resultado</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <p className="text-[9px] font-bold text-green-500 uppercase">Saudável (60+ pts)</p>
              <p className="text-[9px] text-[var(--text-secondary)] leading-snug">Vendas em crescimento, conversão acima de 5% e boa relação investimento/faturamento.</p>
            </div>
            <div className="space-y-1">
              <p className="text-[9px] font-bold text-amber-500 uppercase">Atenção (30-59 pts)</p>
              <p className="text-[9px] text-[var(--text-secondary)] leading-snug">Performance estável ou com sinais de queda na eficiência. Requer ajuste de criativos ou abordagem.</p>
            </div>
            <div className="space-y-1">
              <p className="text-[9px] font-bold text-red-500 uppercase">Crítico (&lt; 30 pts)</p>
              <p className="text-[9px] text-[var(--text-secondary)] leading-snug">Mesmo que deu lucro (ROI+), a loja apresenta queda real de vendas ou conversão muito baixa.</p>
            </div>
          </div>
        </div>

        <div className="sm:hidden mt-3 flex items-center justify-between p-3 rounded-lg bg-brand-medium border border-brand-light">
          <span className="text-[9px] text-gray-600 uppercase tracking-widest">ROI acumulado</span>
          <div className="text-right">
            <p className="text-sm font-bold" style={{ color: roi.status === 'positivo' ? '#22c55e' : '#ef4444' }}>{formatBRL(roi.roiTotal)}</p>
            <p className="text-[9px] text-gray-600">{roi.mesesPositivos}/{roi.meses.length} meses</p>
          </div>
        </div>
      </motion.header>

      {/* Tabs */}
      <motion.div variants={itemVariants} className="flex gap-2 mb-5">
        <div className="flex-1 flex gap-1 bg-brand-medium border border-brand-light rounded-xl p-1">
          <button onClick={() => setTab('visao')} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${tab === 'visao' ? 'bg-brand-light text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
            <BarChart2 className="w-3.5 h-3.5" />Resultados
          </button>
          <button onClick={() => setTab('simulador')} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${tab === 'simulador' ? 'bg-brand-purple text-white' : 'text-gray-500 hover:text-gray-300'}`}>
            <Calculator className="w-3.5 h-3.5" />Simulador
          </button>
          {canSeeMetaAds && (
            <button onClick={() => setTab('meta-ads')} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${tab === 'meta-ads' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
              <Target className="w-3.5 h-3.5" />Meta Ads
            </button>
          )}
        </div>

        {tab === 'visao' && (
          <button 
            onClick={() => setShowFilter(!showFilter)}
            className={`flex items-center gap-2 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
              showFilter 
                ? 'bg-brand-purple border-brand-purple text-white shadow-lg shadow-brand-purple/20' 
                : 'bg-brand-light border-brand-light text-[var(--text-secondary)] hover:border-[var(--text-muted)]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            {showFilter ? 'Ocultar' : 'Filtrar'}
          </button>
        )}
      </motion.div>

      {/* ── ABA RESULTADOS ── */}
      {tab === 'visao' && (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-5 w-full"
        >
          {/* Filtro de meses */}
          <AnimatePresence>
            {showFilter && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mb-5"
              >
                <div className="bg-brand-medium border border-brand-light rounded-2xl px-5 py-4">
                  <MonthFilter
                    allMonths={allChaves}
                    monthLabels={allLabels}
                    selected={selectedMonths}
                    onChange={setSelectedMonths}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Aviso de filtro ativo */}
          {selectedMonths.size < allChaves.length && (
            <motion.div variants={itemVariants} className="px-3 py-2 rounded-lg bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-between">
              <p className="text-[10px] text-brand-purple2">
                Exibindo {selectedMonths.size} de {allChaves.length} meses
              </p>
              <button onClick={() => setSelectedMonths(new Set(allChaves))} className="text-[10px] text-brand-purple2 underline">
                Ver todos
              </button>
            </motion.div>
          )}

          {/* KPIs */}
          <motion.div variants={containerVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <motion.div variants={itemVariants}>
              <StatCard label="Faturamento Total" value={ultimo.faturamentoLoja > 0 ? formatBRL(ultimo.faturamentoLoja) : '—'} subtext={ultimo.mes} icon={DollarSign} />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard label="Venda Tráfego" value={formatBRL(ultimo.vendas)} change={change(ultimo.vendas, penultimo?.vendas ?? null)} icon={TrendingUp} />
            </motion.div>
            <motion.div variants={itemVariants}>
              {hasConversao
                ? <StatCard label={`Conversão (${ultimo.mes})`} value={`${ultimo.conversao.toFixed(1)}%`} change={change(ultimo.conversao, penultimo?.conversao ?? null)} icon={Percent} />
                : <StatCard label="Meses ROI +" value={`${roiFiltered.mesesPositivos} / ${roiFiltered.meses.length}`} subtext="no período" icon={Percent} />
              }
            </motion.div>
            <motion.div variants={itemVariants}>
              {hasMensagens
                ? <StatCard label="Contatos" value={ultimo.mensagens} subtext={`Ticket: ${formatBRL(ultimo.ticketMedio)}`} icon={MessageSquare} />
                : <StatCard label="ROI Período" value={formatBRL(roiFiltered.roiTotal)} subtext={roiFiltered.status === 'positivo' ? 'Positivo ✓' : 'Negativo'} icon={MessageSquare} />
              }
            </motion.div>
          </motion.div>

          {/* Gráficos */}
          <motion.div variants={containerVariants} className={`grid grid-cols-1 ${hasConversao ? 'lg:grid-cols-2' : ''} gap-4`}>
            <motion.div variants={itemVariants}>
              <ChartCard title="Evolução de vendas (R$)">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id={`g-${store.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={store.color} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={store.color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e1e28" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10 }} dy={6} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10 }} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area type="monotone" dataKey="vendas" name="Vendas (R$)" stroke={store.color} strokeWidth={2} fill={`url(#g-${store.id})`} dot={{ r: 3, fill: store.color }} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>
            </motion.div>

            {hasConversao && (
              <motion.div variants={itemVariants}>
                <ChartCard title="Conversão mensal (%)">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e1e28" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10 }} dy={6} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10 }} tickFormatter={v => `${v}%`} />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar dataKey="conversao" name="Conversão (%)" fill={store.color} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </motion.div>
            )}
          </motion.div>

          {/* Projeção + ROI */}
          <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <motion.div variants={itemVariants}>
              <ProjecaoCard store={store} />
            </motion.div>
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <RoiPanel store={storeFiltered} fee={fee} />
            </motion.div>
          </motion.div>

          {/* Feedback da Operação */}
          <motion.div variants={itemVariants} className="bg-brand-medium border border-brand-light rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-brand-purple" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Feedback da Operação</h3>
              {!isMaster && (
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/15">
                  Apenas leitura
                </span>
              )}
            </div>

            {isMaster ? (
              <div className="space-y-2">
                <textarea
                  value={currentFeedback}
                  onChange={e => gestao.updateFeedback(groupId, store.id, store.name, e.target.value)}
                  placeholder="Escreva um feedback estratégico sobre a operação desta loja (ex: novos criativos em andamento, melhorias no atendimento da equipe, etc.)"
                  className="w-full min-h-[100px] bg-brand-dark/50 border border-brand-light/70 rounded-xl p-3.5 text-xs text-gray-200 placeholder-gray-600 outline-none focus:border-brand-purple transition-all resize-y leading-relaxed"
                />
                <p className="text-[9px] text-gray-500 flex items-center justify-between">
                  <span>Salvo automaticamente</span>
                  <span className="font-semibold text-brand-purple/70">O cliente visualizará em modo de apenas leitura</span>
                </p>
              </div>
            ) : (
              <div className="bg-brand-dark/30 border border-white/5 rounded-xl p-4 min-h-[80px] flex flex-col justify-between">
                {currentFeedback.trim() ? (
                  <p className="text-xs text-gray-300 leading-relaxed italic whitespace-pre-wrap">
                    "{currentFeedback}"
                  </p>
                ) : (
                  <p className="text-xs text-gray-650 italic">
                    Nenhum feedback operacional registrado para o período ainda.
                  </p>
                )}
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[9px] text-gray-500 font-bold uppercase tracking-wide">
                  <span>Equipe Aure Digital</span>
                  <span>Canal Oficial de Operação</span>
                </div>
              </div>
            )}
          </motion.div>

          {/* Histórico filtrado */}
          <motion.div variants={itemVariants} className="bg-brand-medium border border-brand-light rounded-xl overflow-hidden">
            <div className="p-4 border-b border-brand-light flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Histórico</h3>
              {selectedMonths.size < allChaves.length && (
                <span className="text-[9px] text-brand-purple2 bg-brand-purple/10 px-2 py-0.5 rounded">
                  {selectedMonths.size} meses filtrados
                </span>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left" style={{ minWidth: hasMensagens ? 640 : 420 }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <th className="px-3 py-2.5 text-[8px] font-bold text-gray-600 uppercase tracking-widest">Mês</th>
                    <th className="px-3 py-2.5 text-[8px] font-bold text-gray-600 uppercase tracking-widest">Vendas</th>
                    {hasFaturamento && <th className="px-3 py-2.5 text-[8px] font-bold text-gray-600 uppercase tracking-widest">Fat. Loja</th>}
                    {hasMensagens  && <th className="px-3 py-2.5 text-[8px] font-bold text-gray-600 uppercase tracking-widest">Msgs</th>}
                    {hasConversao  && <th className="px-3 py-2.5 text-[8px] font-bold text-gray-600 uppercase tracking-widest">Conv.</th>}
                    {hasMensagens  && <th className="px-3 py-2.5 text-[8px] font-bold text-gray-600 uppercase tracking-widest">Ticket</th>}
                    {hasVerba      && <th className="px-3 py-2.5 text-[8px] font-bold text-gray-600 uppercase tracking-widest">Verba</th>}
                    <th className="px-3 py-2.5 text-[8px] font-bold text-gray-600 uppercase tracking-widest">Custo</th>
                    <th className="px-3 py-2.5 text-[8px] font-bold text-gray-600 uppercase tracking-widest">ROI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-light">
                  {filtered.map((m, i) => {
                    const custo  = fee + m.verba;
                    const roiMes = m.vendas - custo;
                    return (
                      <tr key={i} className="hover:bg-brand-light/20 transition-colors">
                        <td className="px-3 py-3 text-xs font-semibold text-gray-300 whitespace-nowrap">{m.mes}</td>
                        <td className="px-3 py-3 text-xs font-bold whitespace-nowrap" style={{ color: m.vendas > 0 ? '#fff' : '#374151' }}>{formatBRL(m.vendas)}</td>
                        {hasFaturamento && <td className="px-3 py-3 text-xs text-gray-500 whitespace-nowrap">{m.faturamentoLoja > 0 ? formatBRL(m.faturamentoLoja) : '—'}</td>}
                        {hasMensagens  && <td className="px-3 py-3 text-xs text-gray-500">{m.mensagens || '—'}</td>}
                        {hasConversao  && <td className="px-3 py-3 text-xs whitespace-nowrap" style={{ color: m.conversao >= 10 ? '#22c55e' : m.conversao >= 3 ? '#f59e0b' : '#6b7280' }}>{m.conversao > 0 ? `${m.conversao.toFixed(1)}%` : '—'}</td>}
                        {hasMensagens  && <td className="px-3 py-3 text-xs text-gray-500 whitespace-nowrap">{m.ticketMedio > 0 ? formatBRL(m.ticketMedio) : '—'}</td>}
                        {hasVerba      && <td className="px-3 py-3 text-xs text-gray-500 whitespace-nowrap">{m.verba > 0 ? formatBRL(m.verba) : '—'}</td>}
                        <td className="px-3 py-3 text-xs text-gray-500 whitespace-nowrap">{formatBRL(custo)}</td>
                        <td className="px-3 py-3 text-xs font-bold whitespace-nowrap" style={{ color: roiMes >= 0 ? '#22c55e' : '#ef4444' }}>{formatBRL(roiMes)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* ── ABA SIMULADOR ── */}
      {tab === 'simulador' && <SimuladorView store={store} fee={fee} />}

      {/* ── ABA META ADS ── */}
      {tab === 'meta-ads' && canSeeMetaAds && (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-5">

          {/* Filtro período */}
          <motion.div variants={itemVariants} className="flex items-center justify-between gap-3">
            <div className="flex gap-1 bg-brand-medium border border-brand-light rounded-xl p-1">
              {DATE_PRESETS.map(p => (
                <button
                  key={p.value}
                  onClick={() => setMetaDatePreset(p.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${metaDatePreset === p.value ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <button onClick={loadMeta} disabled={metaLoading} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white border border-brand-light rounded-lg px-3 py-2 transition-all disabled:opacity-40">
              <RefreshCw className={`w-3.5 h-3.5 ${metaLoading ? 'animate-spin' : ''}`} />
            </button>
          </motion.div>

          {/* Erro */}
          {metaError && (
            <motion.div variants={itemVariants} className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3 text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />{metaError}
            </motion.div>
          )}

          {/* Skeleton */}
          {metaLoading && !metaInsights && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[...Array(7)].map((_, i) => <div key={i} className="bg-brand-medium border border-brand-light rounded-2xl p-4 animate-pulse h-20" />)}
            </div>
          )}

          {/* Metric Cards */}
          {metaInsights && (
            <motion.div variants={containerVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: 'Valor Gasto',       value: formatBRL(metaInsights.spend),         icon: DollarSign,    color: 'text-brand-purple2' },
                { label: 'Mensagens',          value: fmtN(metaInsights.mensagens),          icon: MessageSquare, color: 'text-green-400'     },
                { label: 'Custo / Mensagem',   value: metaInsights.custoMensagem > 0 ? formatBRL(metaInsights.custoMensagem) : '—', icon: TrendingUp, color: 'text-blue-400' },
                { label: 'Alcance',            value: fmtN(metaInsights.reach),              icon: Users,         color: 'text-amber-400'     },
                { label: 'Impressões',         value: fmtN(metaInsights.impressions),        icon: Eye,           color: 'text-cyan-400'      },
                { label: 'Cliques',            value: fmtN(metaInsights.clicks),             icon: MousePointer,  color: 'text-pink-400'      },
                { label: 'Curtidas / Seguid.', value: fmtN(metaInsights.likes),              icon: ThumbsUp,      color: 'text-orange-400'    },
              ].map(card => (
                <motion.div key={card.label} variants={itemVariants} className="bg-brand-medium border border-brand-light rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <card.icon className={`w-4 h-4 shrink-0 ${card.color}`} />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 leading-tight">{card.label}</p>
                  </div>
                  <p className={`text-xl font-black ${card.color}`}>{card.value}</p>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Gráficos */}
          {metaTimeSeries.length > 1 && (
            <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <motion.div variants={itemVariants}>
                <ChartCard title="Gasto diário (R$)">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metaTimeSeries} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e1e28" vertical={false} />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 9 }} tickFormatter={d => new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} interval="preserveStartEnd" />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 9 }} tickFormatter={v => `R$${v}`} />
                      <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #2a2a4a', borderRadius: 8, fontSize: 12 }} labelFormatter={d => new Date(d + 'T12:00:00').toLocaleDateString('pt-BR')} formatter={(v: number) => [formatBRL(v), 'Gasto']} />
                      <Bar dataKey="spend" fill="#2563eb" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </motion.div>
              <motion.div variants={itemVariants}>
                <ChartCard title="Mensagens geradas">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metaTimeSeries} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e1e28" vertical={false} />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 9 }} tickFormatter={d => new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} interval="preserveStartEnd" />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 9 }} />
                      <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #2a2a4a', borderRadius: 8, fontSize: 12 }} labelFormatter={d => new Date(d + 'T12:00:00').toLocaleDateString('pt-BR')} />
                      <Legend wrapperStyle={{ fontSize: 10, color: '#6b7280' }} />
                      <Line dataKey="mensagens" stroke="#22c55e" strokeWidth={2} dot={false} name="Mensagens" />
                      <Line dataKey="reach"     stroke="#60a5fa" strokeWidth={2} dot={false} name="Alcance" />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartCard>
              </motion.div>
            </motion.div>
          )}

          {/* Tabela de campanhas */}
          {metaCampaigns.length > 0 && (
            <motion.div variants={itemVariants} className="bg-brand-medium border border-brand-light rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-brand-light">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Campanhas</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-brand-light">
                      {['Campanha', 'Status', 'Gasto', 'Alcance', 'Impressões', 'Mensagens', 'Custo/Msg'].map(h => (
                        <th key={h} className="text-left text-[9px] font-bold uppercase tracking-widest text-gray-600 px-4 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {metaCampaigns.map((c, i) => (
                      <tr key={c.id} className={`border-b border-brand-light/50 hover:bg-brand-light/20 transition-colors ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}>
                        <td className="px-4 py-3 text-xs font-medium text-white max-w-[180px] truncate">{c.name}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[c.status] ?? 'text-gray-400 bg-gray-400/10'}`}>
                            {STATUS_LABELS[c.status] ?? c.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs font-bold text-white">{c.spend > 0 ? formatBRL(c.spend) : '—'}</td>
                        <td className="px-4 py-3 text-xs text-gray-400">{c.reach > 0 ? fmtN(c.reach) : '—'}</td>
                        <td className="px-4 py-3 text-xs text-gray-400">{c.impressions > 0 ? fmtN(c.impressions) : '—'}</td>
                        <td className="px-4 py-3 text-xs font-bold text-green-400">{c.mensagens > 0 ? fmtN(c.mensagens) : '—'}</td>
                        <td className="px-4 py-3 text-xs text-gray-400">{c.custoMensagem > 0 ? formatBRL(c.custoMensagem) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
