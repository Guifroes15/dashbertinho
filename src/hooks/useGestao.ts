import { useState, useEffect, useCallback } from 'react';

export interface CheckItem {
  id: string;
  texto: string;
  feito: boolean;
  criadoEm: string;
  tipo: 'tarefa' | 'demanda' | 'alinhamento';
}

export interface Nota {
  id: string;
  titulo: string;
  conteudo: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface GestaoLoja {
  storeId: string;
  storeName: string;
  checklist: CheckItem[];
  notas: Nota[];
  feedback?: string;
}

type GestaoState = Record<string, Record<string, GestaoLoja>>;

const STORAGE_KEY = 'aure_gestao_v1';
const uid = () => Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString();

function load(): GestaoState {
  try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : {}; }
  catch { return {}; }
}

export function useGestao() {
  const [state, setState] = useState<GestaoState>(load);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  }, [state]);

  const getLoja = useCallback((gid: string, sid: string, sname: string): GestaoLoja =>
    state[gid]?.[sid] ?? { storeId: sid, storeName: sname, checklist: [], notas: [], feedback: '' },
    [state]);

  const upd = useCallback((gid: string, sid: string, sname: string, patch: Partial<GestaoLoja>) => {
    setState(prev => {
      const g = prev[gid] ?? {};
      const l = g[sid] ?? { storeId: sid, storeName: sname, checklist: [], notas: [], feedback: '' };
      return { ...prev, [gid]: { ...g, [sid]: { ...l, ...patch } } };
    });
  }, []);

  const addItem = useCallback((gid: string, sid: string, sname: string, texto: string, tipo: CheckItem['tipo']) => {
    const l = state[gid]?.[sid] ?? { storeId: sid, storeName: sname, checklist: [], notas: [], feedback: '' };
    upd(gid, sid, sname, { checklist: [...l.checklist, { id: uid(), texto, feito: false, criadoEm: now(), tipo }] });
  }, [state, upd]);

  const toggleItem = useCallback((gid: string, sid: string, itemId: string) => {
    const l = state[gid]?.[sid]; if (!l) return;
    upd(gid, sid, l.storeName, { checklist: l.checklist.map(i => i.id === itemId ? { ...i, feito: !i.feito } : i) });
  }, [state, upd]);

  const deleteItem = useCallback((gid: string, sid: string, itemId: string) => {
    const l = state[gid]?.[sid]; if (!l) return;
    upd(gid, sid, l.storeName, { checklist: l.checklist.filter(i => i.id !== itemId) });
  }, [state, upd]);

  const editItem = useCallback((gid: string, sid: string, itemId: string, texto: string) => {
    const l = state[gid]?.[sid]; if (!l) return;
    upd(gid, sid, l.storeName, { checklist: l.checklist.map(i => i.id === itemId ? { ...i, texto } : i) });
  }, [state, upd]);

  const addNota = useCallback((gid: string, sid: string, sname: string, titulo: string, conteudo: string) => {
    const l = state[gid]?.[sid] ?? { storeId: sid, storeName: sname, checklist: [], notas: [], feedback: '' };
    upd(gid, sid, sname, { notas: [{ id: uid(), titulo, conteudo, criadoEm: now(), atualizadoEm: now() }, ...l.notas] });
  }, [state, upd]);

  const updateNota = useCallback((gid: string, sid: string, nid: string, patch: Partial<Nota>) => {
    const l = state[gid]?.[sid]; if (!l) return;
    upd(gid, sid, l.storeName, { notas: l.notas.map(n => n.id === nid ? { ...n, ...patch, atualizadoEm: now() } : n) });
  }, [state, upd]);

  const deleteNota = useCallback((gid: string, sid: string, nid: string) => {
    const l = state[gid]?.[sid]; if (!l) return;
    upd(gid, sid, l.storeName, { notas: l.notas.filter(n => n.id !== nid) });
  }, [state, upd]);

  const updateFeedback = useCallback((gid: string, sid: string, sname: string, feedback: string) => {
    const l = state[gid]?.[sid] ?? { storeId: sid, storeName: sname, checklist: [], notas: [], feedback: '' };
    upd(gid, sid, sname, { feedback });
  }, [state, upd]);

  const statsGrupo = useCallback((gid: string, stores: { id: string; name: string }[]) => {
    const lojas = stores.map(s => state[gid]?.[s.id] ?? { storeId: s.id, storeName: s.name, checklist: [], notas: [], feedback: '' });
    return {
      total:     lojas.reduce((a, l) => a + l.checklist.length, 0),
      feitas:    lojas.reduce((a, l) => a + l.checklist.filter(i => i.feito).length, 0),
      pendentes: lojas.reduce((a, l) => a + l.checklist.filter(i => !i.feito).length, 0),
      notas:     lojas.reduce((a, l) => a + l.notas.length, 0),
    };
  }, [state]);

  return { getLoja, addItem, toggleItem, deleteItem, editItem, addNota, updateNota, deleteNota, statsGrupo, updateFeedback };
}
