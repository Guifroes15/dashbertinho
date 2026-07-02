import React, { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { GroupData, StoreData, UserProfile } from './types';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { HomeView } from './components/views/HomeView';
import { ConsolidadoView } from './components/views/Consolidado';
import { StoreDetailView } from './components/views/StoreDetail';
import { RankingView } from './components/views/RankingView';
import { EmptyGroupView } from './components/views/EmptyGroupView';
import { AccessGate, AccessState } from './components/views/AccessGate';
import { AuthView }        from './components/views/AuthView';
import { AtendimentoView } from './components/views/AtendimentoView';
import { CriativosView }   from './components/views/CriativosView';
import { VipView }         from './components/views/VipView';
import { DataEntryView }   from './components/views/DataEntryView';
import { MetaAdsView }     from './components/views/MetaAdsView';
import { MetaFeedbackView } from './components/views/MetaFeedbackView';
import { UsersAdminView }  from './components/views/UsersAdminView';
import { useGroups }       from './hooks/useGroups';
import { useAuth, profileToAccessState } from './hooks/useAuth';
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

const SESSION_KEY = 'aure_access';

export default function App() {
  // Firebase Auth — para colegas que usam email/Google
  const { loading: authLoading, accessState: firebaseAccess, logout: firebaseLogout } = useAuth();

  // Senha local — para acessos hardcoded (Guilherme + equipe existente)
  const [localAccess, setLocalAccess] = useState<AccessState | null>(null);

  // Controla exibição da tela de cadastro/login Firebase
  const [showAuthView, setShowAuthView] = useState(false);

  // Combina os dois: Firebase tem prioridade se estiver ativo
  const access = firebaseAccess ?? localAccess;

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

  // Restaura sessão de senha do sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.groupId !== undefined && parsed.groupIds === undefined) {
          parsed.groupIds = parsed.groupId === 'all' ? 'all' : [parsed.groupId as string];
          delete parsed.groupId;
        }
        setLocalAccess(parsed as AccessState);
      } catch {
        sessionStorage.removeItem(SESSION_KEY);
      }
    }
  }, []);

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('aure_theme', next);
      return next;
    });
  };

  // Login por senha (AccessGate)
  const handlePasswordAccess = (state: AccessState) => {
    setLocalAccess(state);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
  };

  // Login por Firebase (AuthView)
  const handleFirebaseLogin = (profile: UserProfile) => {
    setLocalAccess(profileToAccessState(profile));
    setShowAuthView(false);
  };

  const handleLogout = async () => {
    sessionStorage.removeItem(SESSION_KEY);
    if (firebaseAccess) await firebaseLogout();
    setLocalAccess(null);
    setShowAuthView(false);
    setActiveGroupId('');
    setActiveView({ type: 'home' });
  };

  const visibleGroups: GroupData[] = access == null ? [] :
    access.groupIds === 'all'
      ? groups
      : groups.filter(g => Array.isArray(access.groupIds) && access.groupIds.includes(g.id));

  const isMaster    = access?.isMaster ?? false;
  const isStaff     = access?.isStaff  ?? false;
  const nomeUsuario = access?.nome ?? '';

  useEffect(() => {
    if (visibleGroups.length > 0 && !activeGroupId) {
      setActiveGroupId(visibleGroups[0].id);
    }
  }, [access, groups]);

  const activeGroup = visibleGroups.find(g => g.id === activeGroupId) ?? visibleGroups[0];

  const handleGroupChange = (id: string) => { setActiveGroupId(id); setActiveView({ type: 'consolidado' }); };
  const handleNavigate    = (gid: string, view: ActiveView) => { setActiveGroupId(gid); setActiveView(view); };
  const handleViewChange  = (view: ActiveView) => setActiveView(view);

  const activeStore: StoreData | undefined =
    activeView.type === 'store' ? activeGroup?.stores.find(s => s.id === activeView.storeId) : undefined;

  const viewKey = activeView.type === 'store'
    ? `${activeGroupId}-store-${activeView.storeId}`
    : `${activeGroupId}-${activeView.type}`;

  const pageLabel =
    activeView.type === 'home'          ? 'Home'
    : activeView.type === 'atendimento' ? 'Análise de Atendimento'
    : activeView.type === 'criativos'   ? 'Inteligência de Criativos'
    : activeView.type === 'vip'         ? 'Gerador VIP'
    : activeView.type === 'data-entry'  ? 'Lançar Resultado'
    : activeView.type === 'meta-ads'    ? 'Meta Ads'
    : activeView.type === 'meta-feedback' ? 'Feedbacks Meta'
    : activeView.type === 'users'       ? 'Usuários'
    : activeView.type === 'consolidado' ? (activeGroup?.name ?? '')
    : activeView.type === 'ranking'     ? 'Ranking'
    : activeStore?.name ?? '—';

  useEffect(() => {
    if (!isMaster && ['atendimento', 'criativos', 'vip', 'users'].includes(activeView.type)) {
      setActiveView({ type: 'home' });
    }
    if (!isMaster && !isStaff && (activeView.type === 'data-entry' || activeView.type === 'meta-ads' || activeView.type === 'meta-feedback')) {
      setActiveView({ type: 'home' });
    }
  }, [isMaster, isStaff, activeView.type]);

  // ── Firebase verificando sessão ───────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-brand-purple border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Não autenticado ───────────────────────────────────────────────────────
  if (!access) {
    if (showAuthView) {
      return (
        <AuthView
          onBack={() => setShowAuthView(false)}
          onLogin={handleFirebaseLogin}
        />
      );
    }
    return (
      <AccessGate
        onAccess={handlePasswordAccess}
        onCreateAccount={() => setShowAuthView(true)}
      />
    );
  }

  // ── Autenticado via Firebase, mas sem grupos atribuídos ───────────────────
  if (!activeGroup) {
    return (
      <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center gap-6 px-4">
        <div className="text-center space-y-3 max-w-sm">
          <div className="w-14 h-14 bg-brand-light rounded-2xl flex items-center justify-center mx-auto border border-brand-light">
            <Users className="w-7 h-7 text-gray-500" />
          </div>
          <h2 className="text-xl font-bold text-white">Conta criada!</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Seu acesso ainda não tem grupos atribuídos. O administrador vai liberar em breve.
          </p>
          <button
            onClick={handleLogout}
            className="mt-2 px-5 py-2.5 rounded-xl bg-brand-light text-white text-xs font-bold hover:bg-brand-light/80 transition-all"
          >
            Sair
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex min-h-screen bg-brand-dark text-white ${theme}`}>
      <div className="hidden lg:block">
        <Sidebar
          groups={visibleGroups}
          activeGroupId={activeGroupId}
          activeView={activeView}
          isMaster={isMaster}
          isStaff={isStaff}
          onGroupChange={handleGroupChange}
          onViewChange={handleViewChange}
          onLogout={handleLogout}
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
                <HomeView groups={visibleGroups} onNavigate={handleNavigate} nome={nomeUsuario} isMaster={isMaster} />
              )}

              {isMaster && activeView.type === 'atendimento' && <AtendimentoView />}
              {isMaster && activeView.type === 'criativos'   && <CriativosView />}
              {isMaster && activeView.type === 'vip'         && <VipView />}

              {isMaster && activeView.type === 'users' && (
                <UsersAdminView groups={groups} />
              )}

              {(isMaster || isStaff) && activeView.type === 'data-entry' && (
                <DataEntryView groups={visibleGroups} seeded={seeded} isMaster={isMaster} />
              )}

              {(isMaster || isStaff) && activeView.type === 'meta-feedback' && (
                <MetaFeedbackView />
              )}

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
          groups={visibleGroups}
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
