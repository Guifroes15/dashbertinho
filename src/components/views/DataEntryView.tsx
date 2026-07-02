import React, { useState, useMemo } from 'react';
import { PlusCircle, CheckCircle, AlertCircle, RefreshCw, Database } from 'lucide-react';
import { GroupData, MonthData } from '../../types';
import { addOrUpdateMonthData, seedGroupsToFirestore } from '../../services/groupService';
import { GROUPS } from '../../data';

const MONTHS = [
  { label: 'Janeiro',   short: 'Jan', num: '01' },
  { label: 'Fevereiro', short: 'Fev', num: '02' },
  { label: 'Março',     short: 'Mar', num: '03' },
  { label: 'Abril',     short: 'Abr', num: '04' },
  { label: 'Maio',      short: 'Mai', num: '05' },
  { label: 'Junho',     short: 'Jun', num: '06' },
  { label: 'Julho',     short: 'Jul', num: '07' },
  { label: 'Agosto',    short: 'Ago', num: '08' },
  { label: 'Setembro',  short: 'Set', num: '09' },
  { label: 'Outubro',   short: 'Out', num: '10' },
  { label: 'Novembro',  short: 'Nov', num: '11' },
  { label: 'Dezembro',  short: 'Dez', num: '12' },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = [CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1];

interface Props {
  groups: GroupData[];
  seeded: boolean;
  isMaster: boolean;
}

const empty = {
  faturamentoLoja: '',
  vendas: '',
  qtdVendas: '',
  mensagens: '',
  verba: '',
  conversao: '',
};

export function DataEntryView({ groups, seeded, isMaster }: Props) {
  const [groupId, setGroupId]   = useState(groups[0]?.id ?? '');
  const [storeId, setStoreId]   = useState('');
  const [monthIdx, setMonthIdx] = useState(new Date().getMonth());
  const [year, setYear]         = useState(CURRENT_YEAR);
  const [fields, setFields]     = useState(empty);
  const [status, setStatus]     = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [seeding, setSeeding]   = useState(false);
  const [seedDone, setSeedDone] = useState(false);

  const selectedGroup = groups.find((g) => g.id === groupId);
  const stores = selectedGroup?.stores ?? [];

  const storeOptions = useMemo(() => {
    if (!selectedGroup) return [];
    return selectedGroup.stores;
  }, [selectedGroup]);

  const set = (key: keyof typeof empty, val: string) =>
    setFields((prev) => ({ ...prev, [key]: val }));

  const chave = `${year}-${MONTHS[monthIdx].num}`;
  const mes   = `${MONTHS[monthIdx].short}/${String(year).slice(2)}`;

  const vendas    = parseFloat(fields.vendas)          || 0;
  const qtdVendas = parseInt(fields.qtdVendas)         || 0;
  const fat       = parseFloat(fields.faturamentoLoja) || 0;

  const ticketMedio = qtdVendas > 0 ? vendas / qtdVendas : 0;
  const pctAureFat  = fat > 0 ? (vendas / fat) * 100 : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeId) return;

    const data: MonthData = {
      mes,
      chave,
      faturamentoLoja: fat,
      vendas,
      qtdVendas,
      mensagens:  parseInt(fields.mensagens)  || 0,
      verba:      parseFloat(fields.verba)    || 0,
      conversao:  parseFloat(fields.conversao) || 0,
      ticketMedio: parseFloat(ticketMedio.toFixed(2)),
      pctAureFat:  parseFloat(pctAureFat.toFixed(2)),
    };

    setStatus('loading');
    setErrorMsg('');
    try {
      await addOrUpdateMonthData(groupId, storeId, data);
      setStatus('success');
      setFields(empty);
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Erro ao salvar');
      setStatus('error');
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await seedGroupsToFirestore(GROUPS);
      setSeedDone(true);
    } catch {
      // silent
    } finally {
      setSeeding(false);
    }
  };

  const inputCls = 'w-full bg-brand-dark border border-brand-light rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-brand-purple transition-colors';
  const labelCls = 'block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-white">Lançar Resultado</h1>
        <p className="text-sm text-gray-500 mt-1">Adicione ou atualize os dados mensais de uma loja.</p>
      </div>

      {/* Seed banner */}
      {isMaster && !seeded && !seedDone && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3">
          <Database className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-amber-300">Dados ainda não estão no Firestore</p>
            <p className="text-xs text-amber-400/70 mt-0.5">Sincronize os dados base uma única vez para habilitar atualizações em tempo real.</p>
          </div>
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-amber-300 border border-amber-500/30 rounded-lg px-3 py-1.5 hover:bg-amber-500/10 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`} />
            {seeding ? 'Sincronizando…' : 'Sincronizar agora'}
          </button>
        </div>
      )}

      {(seeded || seedDone) && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-3 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
          <p className="text-xs text-green-300 font-bold">Dados em tempo real — qualquer alteração é refletida para todos imediatamente.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-brand-medium border border-brand-light rounded-2xl p-6 space-y-5">

        {/* Grupo + Loja */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Grupo</label>
            <select
              value={groupId}
              onChange={(e) => { setGroupId(e.target.value); setStoreId(''); }}
              className={inputCls + ' appearance-none cursor-pointer'}
            >
              {groups.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Loja</label>
            <select
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
              className={inputCls + ' appearance-none cursor-pointer'}
              required
            >
              <option value="" disabled>Selecione a loja</option>
              {storeOptions.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Mês + Ano */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Mês</label>
            <select
              value={monthIdx}
              onChange={(e) => setMonthIdx(Number(e.target.value))}
              className={inputCls + ' appearance-none cursor-pointer'}
            >
              {MONTHS.map((m, i) => (
                <option key={m.num} value={i}>{m.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Ano</label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className={inputCls + ' appearance-none cursor-pointer'}
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="h-px bg-brand-light" />

        {/* Dados principais */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Faturamento da Loja (R$)</label>
            <input
              type="number" min="0" step="0.01" placeholder="0.00"
              value={fields.faturamentoLoja}
              onChange={(e) => set('faturamentoLoja', e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Vendas WhatsApp (R$)</label>
            <input
              type="number" min="0" step="0.01" placeholder="0.00"
              value={fields.vendas}
              onChange={(e) => set('vendas', e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Qtd. de Vendas</label>
            <input
              type="number" min="0" step="1" placeholder="0"
              value={fields.qtdVendas}
              onChange={(e) => set('qtdVendas', e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Mensagens Enviadas</label>
            <input
              type="number" min="0" step="1" placeholder="0"
              value={fields.mensagens}
              onChange={(e) => set('mensagens', e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Verba (R$)</label>
            <input
              type="number" min="0" step="0.01" placeholder="0.00"
              value={fields.verba}
              onChange={(e) => set('verba', e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Conversão (%)</label>
            <input
              type="number" min="0" step="0.01" placeholder="0.00"
              value={fields.conversao}
              onChange={(e) => set('conversao', e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        {/* Calculados automaticamente */}
        <div className="grid grid-cols-2 gap-4 bg-brand-dark/50 rounded-xl p-4">
          <div>
            <p className={labelCls}>Ticket Médio (auto)</p>
            <p className="text-lg font-bold text-brand-purple2">
              {ticketMedio > 0
                ? ticketMedio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                : '—'}
            </p>
          </div>
          <div>
            <p className={labelCls}>% Aure / Fat. (auto)</p>
            <p className="text-lg font-bold text-brand-purple2">
              {pctAureFat > 0 ? `${pctAureFat.toFixed(2)}%` : '—'}
            </p>
          </div>
        </div>

        {/* Feedback */}
        {status === 'success' && (
          <div className="flex items-center gap-2 text-green-400 text-sm font-bold">
            <CheckCircle className="w-4 h-4" />
            Dados de {mes} salvos com sucesso!
          </div>
        )}
        {status === 'error' && (
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {errorMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={!storeId || status === 'loading'}
          className="w-full py-3 bg-brand-purple hover:bg-brand-purple/90 text-white rounded-xl font-bold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-40"
        >
          {status === 'loading' ? (
            <><RefreshCw className="w-4 h-4 animate-spin" /> Salvando…</>
          ) : (
            <><PlusCircle className="w-4 h-4" /> Salvar resultado de {mes}</>
          )}
        </button>
      </form>
    </div>
  );
}
