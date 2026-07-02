import React, { useState } from 'react';
import { GroupData } from '../../types';
import { ActiveView } from '../../App';
import { totalVendas, ultimoMes, calcRoi, formatBRL } from '../../utils';
import { TrendingUp, TrendingDown, Minus, ArrowRight, Store, AlertTriangle, CheckCircle, ListChecks, FileText, ChevronRight, Target, Lightbulb } from 'lucide-react';
import { GestaoPanel } from './GestaoPanel';
import { useGestao } from '../../hooks/useGestao';

interface Props {
  groups: GroupData[];
  onNavigate: (groupId: string, view: ActiveView) => void;
  nome?: string;
  isMaster?: boolean;
}

function trend(ult: ReturnType<typeof ultimoMes>, pen: ReturnType<typeof ultimoMes> | null) {
  if (!pen || pen.vendas === 0) return 'neutro';
  return ult.vendas > pen.vendas ? 'alta' : ult.vendas < pen.vendas ? 'baixa' : 'neutro';
}

export function HomeView({ groups, onNavigate, nome = '', isMaster = false }: Props) {
  const [gestaoGrupo, setGestaoGrupo] = useState<GroupData | null>(null);
  const gestao = useGestao();

  const hora = new Date().getHours();
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';
  const temNome = nome.trim().length > 0;

  const allStores    = groups.flatMap(g => g.stores);
  const totalGlobal  = allStores.reduce((a, s) => a + totalVendas(s), 0);
  const totalLojas   = allStores.length;
  const roiPositivos = allStores.filter(s => {
    const g = groups.find(g => g.stores.includes(s))!;
    return calcRoi(s, g.fee).status === 'positivo';
  }).length;

  const alertas = allStores.filter(s => {
    const hist = s.historico.filter(m => m.vendas >= 0).slice(-3);
    return hist.length >= 3 && hist.every((m, i, a) => i === 0 || m.vendas <= a[i-1].vendas);
  });

  const thoughts = [
    { icon: Target, text: "O raio de entrega do tráfego pago está otimizado? Focar em 5-10km costuma dobrar a conversão local." },
    { icon: Lightbulb, text: "Google Meu Negócio: posts semanais e respostas rápidas a avaliações melhoram o ranking sem gastar nada." },
    { icon: TrendingUp, text: "O custo por mensagem no WhatsApp está alto? Tente criativos que mostrem o produto 'na mão' ou a fachada da loja." },
    { icon: Lightbulb, text: "Horários de pico: as campanhas locais performam melhor 1h antes e durante o horário comercial/almoço." },
  ];

  return (
    <div className="animate-in fade-in duration-500 space-y-8 py-4">

      {/* Saudação — só aparece quando tem nome (master/staff com nome) */}
      <div className="mb-8">
        {temNome ? (
          <>
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-1">
              {saudacao}, {nome}
            </h1>
            <p className="text-sm text-gray-500">Resumo de todos os grupos · atualizado agora</p>
          </>
        ) : (
          <>
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white mb-1">
              Painel Aure Digital
            </h1>
            <p className="text-sm text-gray-500">Visão geral de todos os grupos</p>
          </>
        )}
      </div>

      {/* KPIs globais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Total acumulado',    value: formatBRL(totalGlobal),           color: '#7c3aed' },
          { label: 'Grupos ativos',      value: groups.length,                    color: '#22c55e' },
          { label: 'Lojas no projeto',   value: totalLojas,                       color: '#f59e0b' },
          { label: 'Lojas ROI positivo', value: `${roiPositivos}/${totalLojas}`,  color: '#ec4899' },
        ].map((k, i) => (
          <div key={i} className="bg-brand-medium border border-brand-light rounded-xl p-4 shadow-lg">
            <div className="w-1.5 h-1.5 rounded-full mb-3" style={{ background: k.color }} />
            <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-1">{k.label}</p>
            <p className="text-xl font-bold text-white">{k.value}</p>
          </div>
        ))}
      </div>

      {/* Alertas */}
      {alertas.length > 0 && (
        <div className="mb-8 bg-amber-950/20 border border-amber-900/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 animate-pulse" />
            <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">
              {alertas.length} {alertas.length === 1 ? 'loja precisa de atenção' : 'lojas precisam de atenção'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {alertas.map(s => {
              const g = groups.find(gr => gr.stores.includes(s))!;
              return (
                <button key={s.id} onClick={() => onNavigate(g.id, { type: 'store', storeId: s.id })}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/30 border border-amber-900/30 text-xs text-amber-600 hover:bg-amber-900/40 transition-all cursor-pointer">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
                  {s.name} <ArrowRight className="w-3 h-3" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── GESTÃO DE CONTAS ──────────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="mb-3">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Gestão de contas</h2>
          <p className="text-[10px] text-gray-600 mt-0.5">
            Checklist, demandas e anotações por grupo · clique para abrir
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {groups.map(group => {
            const stats = gestao.statsGrupo(group.id, group.stores.map(s => ({ id: s.id, name: s.name })));
            const progresso = stats.total > 0 ? Math.round((stats.feitas / stats.total) * 100) : 0;

            return (
              <button key={group.id} onClick={() => setGestaoGrupo(group)}
                className="text-left p-4 rounded-xl border transition-all hover:border-gray-500 group relative overflow-hidden cursor-pointer w-full text-white"
                style={{ background: 'rgba(255,255,255,.02)', borderColor: 'rgba(255,255,255,.06)' }}>

                {/* Faixa colorida */}
                <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: group.color }} />

                {/* Header */}
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${group.color}15`, border: `1px solid ${group.color}25` }}>
                    <ListChecks className="w-3.5 h-3.5" style={{ color: group.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[var(--text-primary)] truncate">{group.name}</p>
                    <p className="text-[9px] text-gray-600">{group.stores.length} lojas</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-700 group-hover:text-gray-400 transition-colors shrink-0" />
                </div>

                {/* Contadores */}
                <div className="flex items-center gap-3 mb-2.5">
                  {stats.pendentes > 0 ? (
                    <span className="text-[10px] font-bold" style={{ color: '#f59e0b' }}>
                      {stats.pendentes} pendente{stats.pendentes > 1 ? 's' : ''}
                    </span>
                  ) : stats.total > 0 ? (
                    <span className="text-[10px] font-bold" style={{ color: '#22c55e' }}>✓ Tudo feito</span>
                  ) : (
                    <span className="text-[10px] text-gray-700">Sem itens ainda</span>
                  )}
                  {stats.notas > 0 && (
                    <span className="flex items-center gap-1 text-[10px] text-gray-650">
                      <FileText className="w-3 h-3" />
                      {stats.notas} nota{stats.notas > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {/* Barra de progresso */}
                {stats.total > 0 ? (
                  <div>
                    <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,.06)' }}>
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${progresso}%`, background: progresso === 100 ? '#22c55e' : group.color }} />
                    </div>
                    <p className="text-[9px] text-gray-700 mt-1">{progresso}% concluído · {stats.feitas}/{stats.total}</p>
                  </div>
                ) : (
                  <p className="text-[9px] text-gray-700">Clique para adicionar tarefas e notas →</p>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── GRUPOS / LOJAS ─────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="mb-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Acompanhamento de Resultados</h2>
          <p className="text-[10px] text-gray-500 mt-0.5">Visão consolidada por grupo de contas com acesso rápido aos relatórios</p>
        </div>

        {groups.map(group => {
          const hasStores   = group.stores.length > 0;
          const groupTotal  = group.stores.reduce((a, s) => a + totalVendas(s), 0);
          const groupRoiPos = group.stores.filter(s => calcRoi(s, group.fee).status === 'positivo').length;

          return (
            <div key={group.id} className="bg-brand-medium border border-brand-light rounded-xl overflow-hidden shadow-lg">
              {/* Header grupo - Resumo completo */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-5 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: group.color }} />
                  <div>
                    <p className="text-sm font-bold text-white">{group.name}</p>
                    <p className="text-[10px] text-gray-500">
                      {hasStores ? `${group.stores.length} lojas · Fee R$ ${group.fee.toLocaleString('pt-BR')}/loja` : 'Aguardando dados'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                  {hasStores && (
                    <>
                      <div className="text-left sm:text-right">
                        <p className="text-[9px] text-gray-600 uppercase tracking-widest mb-0.5">Total acumulado</p>
                        <p className="text-sm font-bold text-white">{formatBRL(groupTotal)}</p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-[9px] text-gray-600 uppercase tracking-widest mb-0.5">ROI positivo</p>
                        <p className="text-sm font-bold" style={{ color: groupRoiPos > 0 ? '#22c55e' : '#ef4444' }}>
                          {groupRoiPos}/{group.stores.length}
                        </p>
                      </div>
                    </>
                  )}
                  <button onClick={() => onNavigate(group.id, { type: 'consolidado' })}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-light border border-brand-light text-xs font-semibold text-gray-300 hover:text-white hover:border-gray-600 transition-all cursor-pointer shrink-0">
                    Ver grupo <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dicas de Sucesso */}
      {isMaster && (
        <div className="w-full pt-4">
          <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-4">Dicas de Sucesso</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {thoughts.map((t, i) => (
              <div 
                key={i} 
                className="group p-5 bg-brand-medium border border-brand-light rounded-2xl hover:border-brand-purple/50 transition-all cursor-default"
              >
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-brand-purple/10 text-brand-purple group-hover:scale-110 transition-transform shrink-0">
                    <t.icon className="w-5 h-5" />
                  </div>
                  <p className="text-xs md:text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] leading-relaxed transition-colors">
                    {t.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Painel lateral de gestão */}
      {gestaoGrupo && (
        <GestaoPanel group={gestaoGrupo} onClose={() => setGestaoGrupo(null)} />
      )}
    </div>
  );
}
