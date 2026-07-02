import React, { useState } from 'react';
import { TrendingUp, LayoutDashboard, BarChart2, ChevronDown, ChevronRight, Home, LogOut, MessageSquare, Zap, Crown, PlusCircle, Send, Users } from 'lucide-react';
import { GroupData } from '../types';
import { ActiveView } from '../App';

interface Props {
  groups: GroupData[];
  activeGroupId: string;
  activeView: ActiveView;
  onGroupChange: (id: string) => void;
  onViewChange: (view: ActiveView) => void;
  onLogout?: () => void;
  isMaster?: boolean;
  isStaff?: boolean;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export function Sidebar({
  groups,
  activeGroupId,
  activeView,
  onGroupChange,
  onViewChange,
  onLogout,
  isMaster = false,
  isStaff = false,
  theme,
  onToggleTheme
}: Props) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set([activeGroupId]));

  const toggleGroup = (id: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const isActiveView = (view: ActiveView) => {
    if (activeView.type !== view.type) return false;
    if (view.type === 'store' && activeView.type === 'store')
      return activeView.storeId === view.storeId;
    return true;
  };

  const navBtn = (label: string, view: ActiveView, Icon: React.ElementType) => {
    const active = isActiveView(view);
    return (
      <button
        onClick={() => onViewChange(view)}
        className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition-all ${
          active
            ? 'bg-brand-light text-white border-l-2 -ml-px border-brand-purple'
            : 'text-gray-500 hover:text-gray-300 hover:bg-brand-light/40'
        }`}
      >
        <Icon className="w-3.5 h-3.5 shrink-0" />
        <span className="font-medium">{label}</span>
      </button>
    );
  };

  return (
    <aside className="w-72 bg-brand-medium border-r border-brand-light p-5 flex flex-col fixed h-screen left-0 overflow-y-auto">

      {/* Logo */}
      <div className="mb-6">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-7 h-7 bg-brand-purple/20 border border-brand-purple/30 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-brand-purple" />
          </div>
          <span className="text-base font-bold text-white">Aure Digital</span>
        </div>
        <p className="text-[9px] text-gray-700 font-bold uppercase tracking-widest pl-9">Painel de Controle</p>
      </div>

      <nav className="flex-1 space-y-4">

        {/* Home */}
        <div className="space-y-0.5">
          <button
            onClick={() => onViewChange({ type: 'home' })}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all text-left ${
              activeView.type === 'home'
                ? 'bg-brand-light text-white border-l-2 border-brand-purple'
                : 'text-gray-400 hover:bg-brand-light/50 hover:text-white'
            }`}
          >
            <Home className="w-4 h-4 shrink-0" />
            <span className="text-sm font-bold">Home</span>
          </button>
        </div>

        {/* Ferramentas IA — só master */}
        {isMaster && (
          <div className="space-y-1">
            <p className="text-[9px] font-bold text-gray-700 uppercase tracking-widest px-3 mb-1.5">Ferramentas IA</p>
            <div className="space-y-0.5">
              <button
                onClick={() => onViewChange({ type: 'atendimento' })}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all text-left cursor-pointer ${
                  activeView.type === 'atendimento'
                    ? 'bg-brand-light text-white border-l-2 border-brand-purple'
                    : 'text-gray-400 hover:bg-brand-light/50 hover:text-white'
                }`}
              >
                <MessageSquare className="w-4 h-4 shrink-0" />
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold">Análise de Atendimento</span>
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-brand-purple/20 text-brand-purple2 border border-brand-purple/25">IA</span>
                </div>
              </button>

              <button
                onClick={() => onViewChange({ type: 'criativos' })}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all text-left cursor-pointer ${
                  activeView.type === 'criativos'
                    ? 'bg-brand-light text-white border-l-2 border-brand-purple'
                    : 'text-gray-400 hover:bg-brand-light/50 hover:text-white'
                }`}
              >
                <Zap className="w-4 h-4 shrink-0" />
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold">Criativos</span>
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-brand-purple/20 text-brand-purple2 border border-brand-purple/25">IA</span>
                </div>
              </button>

              <button
                onClick={() => onViewChange({ type: 'vip' })}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all text-left cursor-pointer ${
                  activeView.type === 'vip'
                    ? 'bg-brand-light text-white border-l-2 border-brand-purple'
                    : 'text-gray-400 hover:bg-brand-light/50 hover:text-white'
                }`}
              >
                <Crown className="w-4 h-4 shrink-0" />
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold">Gerador VIP</span>
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-brand-purple/20 text-brand-purple2 border border-brand-purple/25">IA</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Admin — só master */}
        {isMaster && (
          <div className="space-y-1">
            <p className="text-[9px] font-bold text-gray-700 uppercase tracking-widest px-3 mb-1.5">Administração</p>
            <div className="space-y-0.5">
              <button
                onClick={() => onViewChange({ type: 'users' })}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all text-left cursor-pointer ${
                  activeView.type === 'users'
                    ? 'bg-brand-light text-white border-l-2 border-brand-purple'
                    : 'text-gray-400 hover:bg-brand-light/50 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4 shrink-0" />
                <span className="text-sm font-bold">Usuários</span>
              </button>
            </div>
          </div>
        )}

        {/* Operações — master e staff */}
        {(isMaster || isStaff) && (
          <div className="space-y-1">
            <p className="text-[9px] font-bold text-gray-700 uppercase tracking-widest px-3 mb-1.5">Operações</p>
            <div className="space-y-0.5">
              <button
                onClick={() => onViewChange({ type: 'data-entry' })}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all text-left cursor-pointer ${
                  activeView.type === 'data-entry'
                    ? 'bg-brand-light text-white border-l-2 border-brand-purple'
                    : 'text-gray-400 hover:bg-brand-light/50 hover:text-white'
                }`}
              >
                <PlusCircle className="w-4 h-4 shrink-0" />
                <span className="text-sm font-bold">Lançar Resultado</span>
              </button>

              <button
                onClick={() => onViewChange({ type: 'meta-feedback' })}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all text-left cursor-pointer ${
                  activeView.type === 'meta-feedback'
                    ? 'bg-brand-light text-white border-l-2 border-brand-purple'
                    : 'text-gray-400 hover:bg-brand-light/50 hover:text-white'
                }`}
              >
                <Send className="w-4 h-4 shrink-0" />
                <span className="text-sm font-bold">Feedbacks Meta</span>
              </button>
            </div>
          </div>
        )}

        {/* Grupos */}
        <div>
          <p className="text-[9px] font-bold text-gray-700 uppercase tracking-widest px-3 mb-1.5">
            {isMaster ? 'Grupos' : 'Sua Operação'}
          </p>
          {groups.map(group => {
            const isActiveGroup = activeGroupId === group.id && activeView.type !== 'home';
            const isExpanded = expandedGroups.has(group.id);
            const hasStores = group.stores.length > 0;

            return (
              <div key={group.id} className="mb-0.5">
                <div
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all ${
                    isActiveGroup ? 'bg-brand-light' : 'hover:bg-brand-light/50'
                  }`}
                >
                  <button
                    onClick={() => {
                      onGroupChange(group.id);
                      if (!isExpanded) toggleGroup(group.id);
                    }}
                    className="flex-1 flex items-center gap-2.5 text-left min-w-0"
                  >
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: group.color }} />
                    <span className={`flex-1 text-sm font-bold truncate ${isActiveGroup ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
                      {group.name}
                    </span>
                    {hasStores && isMaster && <span className="text-[9px] text-gray-600 mr-1">{group.stores.length}</span>}
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); toggleGroup(group.id); }}
                    className="p-0.5 rounded hover:bg-brand-light text-gray-600 hover:text-gray-300 transition-colors"
                  >
                    {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {isExpanded && (isActiveGroup || !isMaster) && (
                  <div className="ml-3 mt-0.5 space-y-0.5 border-l border-brand-light pl-3">
                    {navBtn('Consolidado', { type: 'consolidado' }, LayoutDashboard)}
                    {hasStores && isMaster && navBtn('Msgs vs. Conversão', { type: 'ranking' }, BarChart2)}

                    {hasStores && (
                      <p className="text-[8px] font-bold text-gray-700 uppercase tracking-widest px-2.5 pt-2 pb-1">Lojas</p>
                    )}

                    {group.stores.map(store => {
                      const active = isActiveView({ type: 'store', storeId: store.id });
                      return (
                        <button
                          key={store.id}
                          onClick={() => onViewChange({ type: 'store', storeId: store.id })}
                          className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition-all text-left ${
                            active ? 'bg-brand-light text-white border-l-2 -ml-px' : 'text-gray-500 hover:text-gray-300 hover:bg-brand-light/40'
                          }`}
                          style={active ? { borderLeftColor: store.color } : {}}
                        >
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: store.color }} />
                          <span className="font-medium truncate">{store.name}</span>
                        </button>
                      );
                    })}

                    {!hasStores && (
                      <p className="text-[10px] text-gray-700 px-2.5 py-2 italic">Aguardando dados…</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="mt-auto pt-4 border-t border-brand-light space-y-2">
        <div className="flex items-center justify-between gap-2 px-2">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shrink-0" />
            <span className="text-[9px] font-bold uppercase tracking-wider text-gray-700">Sistema ativo</span>
          </div>
          <button
            onClick={onToggleTheme}
            className="p-1 rounded bg-brand-light hover:bg-brand-light/90 border border-white/5 hover:border-brand-purple/40 text-gray-400 hover:text-white transition-all cursor-pointer flex items-center justify-center shrink-0"
            title={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
          >
            {theme === 'dark' ? (
              <svg className="w-3.5 h-3.5 text-amber-500 hover:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5 text-indigo-600 hover:text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>
        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] text-gray-700 hover:text-red-400 hover:bg-red-900/10 transition-all cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
            Sair
          </button>
        )}
      </div>
    </aside>
  );
}
