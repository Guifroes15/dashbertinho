import React, { useState, useEffect } from 'react';
import { StoreData } from './types';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { HomeView } from './components/views/HomeView';
import { ConsolidadoView } from './components/views/Consolidado';
import { StoreDetailView } from './components/views/StoreDetail';
import { RankingView } from './components/views/RankingView';
import { EmptyGroupView } from './components/views/EmptyGroupView';
import { AtendimentoView } from './components/views/AtendimentoView';
import { CriativosView }   from './components/views/CriativosView';
import { VipView }         from './components/views/VipView';
import { DataEntryView }   from './components/views/DataEntryView';
import { MetaAdsView }     from './components/views/MetaAdsView';
import { MetaFeedbackView } from './components/views/MetaFeedbackView';
import { UsersAdminView }  from './components/views/UsersAdminView';
import { useGroups }       from './hooks/useGroups';
import { motion, AnimatePresence } from 'motion/react';

export type ActiveView =
  | { type: 'home' }
  | { type: 'consolidado' }
  | { type: 'ranking' }
  | { type: 'atendimento' }
  | { type: 'criativos' }
  | { type: 'vip' }
  | { type: 'data-entry' }
  | { type: 'meta-ads' }
  | { type: 'meta-feedback' }
  | { type: 'users' }
  | { type: 'store'; storeId: string };

export default function App() {
  const [activeGroupId, setActiveGroupId] = useState('');
  const [activeView, setActiveView]       = useState<ActiveView>({ type: 'home' });
  const [theme, setTheme]                 = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('aure_theme') as 'dark' | 'light') ?? 'dark';
  });

  const { groups, seeded } = useGroups();

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('aure_theme', next);
      return next;
    });
  };

  const isMaster = true;
  const isStaff  = true;

  useEffect(() => {
    if (groups.length > 0 && !activeGroupId) {
      setActiveGroupId(groups[0].id);
    }
  }, [groups]);

  const activeGroup = groups.find((g: { id: string }) => g.id === activeGroupId) ?? groups[0];

  const handleGroupChange = (id: string) => { setActiveGroupId(id); setActiveView({ type: 'consolidado' }); };
  const handleNavigate    = (gid: string, view: ActiveView) => { setActiveGroupId(gid); setActiveView(view); };
  const handleViewChange  = (view: ActiveView) => setActiveView(view);

  const activeStore: StoreData | undefined =
    activeView.type === 'store' ? activeGroup?.stores.find((s: StoreData) => s.id === activeView.storeId) : undefined;

  const viewKey = activeView.type === 'store'
    ? `${activeGroupId}-store-${activeView.storeId}`
    : `${activeGroupId}-${activeView.type}`;

  const pageLabel =
    activeView.type === 'home'            ? 'Home'
    : activeView.type === 'atendimento'   ? 'Análise de Atendimento'
    : activeView.type === 'criativos'     ? 'Inteligência de Criativos'
    : activeView.type === 'vip'           ? 'Gerador VIP'
    : activeView.type === 'data-entry'    ? 'Lançar Resultado'
    : activeView.type === 'meta-ads'      ? 'Meta Ads'
    : activeView.type === 'meta-feedback' ? 'Feedbacks Meta'
    : activeView.type === 'users'         ? 'Usuários'
    : activeView.type === 'consolidado'   ? (activeGroup?.name ?? '')
    : activeView.type === 'ranking'       ? 'Ranking'
    : activeStore?.name ?? '—';

  if (!activeGroup) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-brand-purple border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={`flex min-h-screen bg-brand-dark text-white ${theme}`}>
      <div className="hidden lg:block">
        <Sidebar
          groups={groups}
          activeGroupId={activeGroupId}
          activeView={activeView}
          isMaster={isMaster}
          isStaff={isStaff}
          onGroupChange={handleGroupChange}
          onViewChange={handleViewChange}
          onLogout={() => {}}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      </div>

      <main className="flex-1 lg:ml-72 pb-24 lg:pb-0 min-h-screen">
        <header className="lg:hidden sticky top-0 z-40 bg-brand-medium/95 backdrop-blur border-b border-brand-light px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: activeGroup.color }} />
            <span className="text-xs font-bold text-brand-purple">Aure Digital</span>
            {activeView.type !== 'home' && (
              <><span className="text-gray-700 text-xs">/</span><span className="text-xs text-gray-500">{activeGroup.name}</span></>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-1 rounded-lg bg-brand-light border border-white/5 text-gray-400 hover:text-white transition-all cursor-pointer flex items-center justify-center shrink-0"
            >
              {theme === 'dark' ? (
                <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <span className="text-[10px] text-gray-650 bg-brand-light px-2 py-1 rounded border border-brand-light truncate max-w-[120px]">
              {pageLabel}
            </span>
          </div>
        </header>

        <div className="px-4 py-6 lg:p-10">
          <AnimatePresence mode="wait">
            <motion.div key={viewKey}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}>

              {activeView.type === 'home' && (
                <HomeView groups={groups} onNavigate={handleNavigate} nome="" isMaster={isMaster} />
              )}

              {activeView.type === 'atendimento' && <AtendimentoView />}
              {activeView.type === 'criativos'   && <CriativosView />}
              {activeView.type === 'vip'         && <VipView />}
              {activeView.type === 'users'        && <UsersAdminView groups={groups} />}

              {activeView.type === 'data-entry' && (
                <DataEntryView groups={groups} seeded={seeded} isMaster={isMaster} />
              )}

              {activeView.type === 'meta-feedback' && <MetaFeedbackView />}

              {activeView.type === 'consolidado' && activeGroup.stores.length === 0 && <EmptyGroupView group={activeGroup} />}
              {activeView.type === 'consolidado' && activeGroup.stores.length > 0 && (
                <ConsolidadoView group={activeGroup} onStoreClick={id => handleViewChange({ type: 'store', storeId: id })} />
              )}
              {activeView.type === 'ranking' && activeGroup.stores.length > 0 && <RankingView stores={activeGroup.stores} />}
              {activeView.type === 'store' && activeStore && (
                <StoreDetailView
                  store={activeStore}
                  fee={activeStore.fee ?? activeGroup.fee}
                  isMaster={isMaster}
                  isStaff={isStaff}
                  groupId={activeGroupId}
                />
              )}
            </motion.div>
          </AnimatePresence>

          <footer className="mt-16 pt-6 border-t border-brand-light flex justify-between items-center text-[10px] font-bold text-gray-700 uppercase tracking-[0.2em]">
            <span>Aure Digital © 2026</span>
          </footer>
        </div>
      </main>

      <div className="lg:hidden">
        <BottomNav
          groups={groups}
          activeGroupId={activeGroupId}
          activeView={activeView}
          isMaster={isMaster}
          onGroupChange={handleGroupChange}
          onViewChange={handleViewChange}
        />
      </div>
    </div>
  );
}
