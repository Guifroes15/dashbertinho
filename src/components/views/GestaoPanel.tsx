import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X, Plus, Check, Trash2, FileText, ListChecks,
  ChevronDown, Edit2, AlertCircle, CheckSquare,
  MessageSquare, Notebook,
} from 'lucide-react';
import { motion } from 'motion/react';
import { GroupData } from '../../types';
import { useGestao, CheckItem, Nota } from '../../hooks/useGestao';

// ── Helpers ───────────────────────────────────────────────────────────────────
const TIPO_CONFIG: Record<CheckItem['tipo'], { label: string; color: string; bg: string; Icon: React.ElementType }> = {
  tarefa:      { label: 'Tarefa',      color: '#a78bfa', bg: 'rgba(124,58,237,.12)',  Icon: CheckSquare   },
  demanda:     { label: 'Demanda',     color: '#f59e0b', bg: 'rgba(245,158,11,.12)',  Icon: AlertCircle   },
  alinhamento: { label: 'Alinhamento', color: '#22c55e', bg: 'rgba(34,197,94,.12)',   Icon: MessageSquare },
};

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' });

// Groups notes/atas by creation Month & Year nicely formatted and type-safe
const getNotesByMonth = <T extends Nota>(notas: T[]) => {
  const groups: Record<string, { label: string; yearNum: number; monthNum: number; items: T[] }> = {};
  
  notas.forEach(n => {
    const d = new Date(n.criadoEm);
    const year = d.getFullYear();
    const month = d.getMonth(); // 0-11
    const key = `${year}-${String(month + 1).padStart(2, '0')}`;
    
    if (!groups[key]) {
      const label = d.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
      const capitalized = label.charAt(0).toUpperCase() + label.slice(1);
      groups[key] = {
        label: capitalized,
        yearNum: year,
        monthNum: month,
        items: []
      };
    }
    groups[key].items.push(n);
  });
  
  return Object.entries(groups)
    .sort((a, b) => b[0].localeCompare(a[0])) // Sort newest month first
    .map(([key, value]) => ({ key, ...value }));
};

interface ChecklistItemProps {
  item: CheckItem;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: (t: string) => void;
  key?: React.Key;
}

// ── ChecklistItem ─────────────────────────────────────────────────────────────
function ChecklistItem({ item, onToggle, onDelete, onEdit }: ChecklistItemProps) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(item.texto);
  const inputRef = useRef<HTMLInputElement>(null);
  const { color, bg, label } = TIPO_CONFIG[item.tipo];

  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  const save = () => {
    if (val.trim()) onEdit(val.trim());
    setEditing(false);
  };

  return (
    <div className={`group flex items-start gap-2.5 px-3 py-2.5 rounded-xl border transition-all ${item.feito ? 'opacity-50' : ''}`}
      style={{ background: item.feito ? 'rgba(255,255,255,.015)' : 'rgba(255,255,255,.03)', borderColor: 'rgba(255,255,255,.05)' }}>

      {/* Checkbox */}
      <button onClick={onToggle}
        className="mt-0.5 shrink-0 w-4 h-4 rounded transition-all flex items-center justify-center cursor-pointer"
        style={{ background: item.feito ? '#22c55e' : 'transparent', border: item.feito ? 'none' : '1.5px solid #3a3a50' }}>
        {item.feito && <Check className="w-2.5 h-2.5 text-white" />}
      </button>

      {/* Conteúdo */}
      <div className="flex-1 min-w-0">
        {editing ? (
          <input ref={inputRef} value={val} onChange={e => setVal(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false); }}
            onBlur={save}
            className="w-full bg-brand-dark border border-brand-purple rounded-lg px-2 py-0.5 text-sm text-white outline-none" />
        ) : (
          <p className={`text-sm leading-snug ${item.feito ? 'line-through text-gray-600' : 'text-gray-200'}`}>
            {item.texto}
          </p>
        )}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: bg, color }}>{label}</span>
          <span className="text-[9px] text-gray-700">{fmt(item.criadoEm)}</span>
        </div>
      </div>

      {/* Ações */}
      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5">
        <button onClick={() => setEditing(true)} title="Editar"
          className="p-1 rounded text-gray-700 hover:text-gray-400 transition-colors cursor-pointer"><Edit2 className="w-3 h-3" /></button>
        <button onClick={onDelete} title="Excluir"
          className="p-1 rounded text-gray-700 hover:text-red-400 transition-colors cursor-pointer"><Trash2 className="w-3 h-3" /></button>
      </div>
    </div>
  );
}

interface NotaCardProps {
  nota: Nota;
  onUpdate: (p: Partial<Nota>) => void;
  onDelete: () => void;
  onSelect?: () => void;
  key?: React.Key;
}

// ── NotaCard ──────────────────────────────────────────────────────────────────
function NotaCard({ nota, onUpdate, onDelete, onSelect }: NotaCardProps) {
  const [editing, setEditing]   = useState(false);
  const [titulo, setTitulo]     = useState(nota.titulo);
  const [conteudo, setConteudo] = useState(nota.conteudo);

  const save = () => {
    if (titulo.trim()) { onUpdate({ titulo: titulo.trim(), conteudo: conteudo.trim() }); setEditing(false); }
  };

  return (
    <div className="rounded-xl border overflow-hidden transition-all duration-200 hover:border-white/10"
      style={{ background: 'rgba(255,255,255,.02)', borderColor: 'rgba(255,255,255,.05)' }}>
      {editing ? (
        <div className="p-3 space-y-2">
          <input value={titulo} onChange={e => setTitulo(e.target.value)}
            className="w-full bg-brand-dark border border-brand-purple rounded-lg px-3 py-1.5 text-sm font-semibold text-white outline-none" />
          <textarea value={conteudo} onChange={e => setConteudo(e.target.value)} rows={5}
            className="w-full bg-brand-dark border border-brand-light rounded-lg px-3 py-2 text-sm text-gray-300 outline-none resize-none leading-relaxed focus:border-brand-purple transition-colors" />
          <div className="flex gap-2">
            <button onClick={save}
              className="px-3 py-1.5 rounded-lg bg-brand-purple text-white text-xs font-bold hover:bg-brand-purple/90 transition-all cursor-pointer">
              Salvar
            </button>
            <button onClick={() => setEditing(false)}
              className="px-3 py-1.5 rounded-lg bg-brand-light text-gray-400 text-xs hover:text-white transition-all cursor-pointer">
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div 
          onClick={onSelect}
          className="group p-3 cursor-pointer hover:bg-white/[.03] active:bg-white/[.05] transition-all"
        >
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <p className="text-sm font-bold text-white leading-snug group-hover:text-brand-purple transition-colors truncate flex-1">{nota.titulo}</p>
            <div 
              onClick={e => e.stopPropagation()} 
              className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
            >
              <button onClick={() => setEditing(true)}
                className="p-1 text-gray-700 hover:text-gray-400 transition-colors cursor-pointer"><Edit2 className="w-3 h-3" /></button>
              <button onClick={onDelete}
                className="p-1 text-gray-700 hover:text-red-400 transition-colors cursor-pointer"><Trash2 className="w-3 h-3" /></button>
            </div>
          </div>
          {nota.conteudo && (
            <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mt-0.5 whitespace-pre-wrap">{nota.conteudo}</p>
          )}
          <div className="flex items-center justify-between gap-2 mt-2">
            <p className="text-[9px] text-gray-700">
              {nota.criadoEm !== nota.atualizadoEm ? `Editado ${fmt(nota.atualizadoEm)}` : fmt(nota.criadoEm)}
            </p>
            {onSelect && (
              <span className="text-[8px] font-bold text-brand-purple opacity-0 group-hover:opacity-100 transition-opacity">
                Ler nota completa &rarr;
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface LojaPanelProps {
  groupId: string;
  storeId: string;
  storeName: string;
  color: string;
  gestao: ReturnType<typeof useGestao>;
  onSelectNota: (nota: Nota, storeId: string, storeName: string, storeColor: string) => void;
  key?: React.Key;
}

// ── LojaPanel ─────────────────────────────────────────────────────────────────
function LojaPanel({ groupId, storeId, storeName, color, gestao, onSelectNota }: LojaPanelProps) {
  const [open, setOpen]           = useState(false);
  const [tab, setTab]             = useState<'checklist' | 'notas'>('checklist');
  const [novoItem, setNovoItem]   = useState('');
  const [tipoNovo, setTipoNovo]   = useState<CheckItem['tipo']>('tarefa');
  const [addingNota, setAddingNota] = useState(false);
  const [novaNota, setNovaNota]   = useState({ titulo: '', conteudo: '' });
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  const loja = gestao.getLoja(groupId, storeId, storeName);
  const pendentes = loja.checklist.filter(i => !i.feito).length;
  const concluidos = loja.checklist.filter(i => i.feito).length;

  const handleAddItem = () => {
    if (!novoItem.trim()) return;
    gestao.addItem(groupId, storeId, storeName, novoItem.trim(), tipoNovo);
    setNovoItem('');
  };

  const handleAddNota = () => {
    if (!novaNota.titulo.trim()) return;
    gestao.addNota(groupId, storeId, storeName, novaNota.titulo.trim(), novaNota.conteudo.trim());
    setNovaNota({ titulo: '', conteudo: '' });
    setAddingNota(false);
  };

  return (
    <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'rgba(255,255,255,.06)' }}>
      {/* Header */}
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-2.5 px-4 py-3 text-left transition-colors hover:bg-white/[.02] cursor-pointer"
        style={{ background: 'rgba(255,255,255,.02)' }}>
        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
        <span className="flex-1 text-sm font-semibold text-gray-200 truncate">{storeName}</span>

        <div className="flex items-center gap-2 text-[10px]">
          {pendentes > 0 && (
            <span className="px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(245,158,11,.12)', color: '#f59e0b' }}>
              {pendentes} pendente{pendentes > 1 ? 's' : ''}
            </span>
          )}
          {concluidos > 0 && (
            <span className="px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(34,197,94,.1)', color: '#22c55e' }}>
              {concluidos} feita{concluidos > 1 ? 's' : ''}
            </span>
          )}
          {loja.notas.length > 0 && (
            <span className="text-gray-600">{loja.notas.length} nota{loja.notas.length > 1 ? 's' : ''}</span>
          )}
          {loja.checklist.length === 0 && loja.notas.length === 0 && (
            <span className="text-gray-700">vazio</span>
          )}
        </div>

        <ChevronDown className={`w-3.5 h-3.5 text-gray-600 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Conteúdo expandido */}
      {open && (
        <div className="border-t px-4 py-3 space-y-3" style={{ borderColor: 'rgba(255,255,255,.05)' }}>

          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(0,0,0,.3)' }}>
            <button onClick={() => setTab('checklist')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                tab === 'checklist' ? 'bg-brand-light text-white' : 'text-gray-600 hover:text-gray-400'
              }`}>
              <ListChecks className="w-3.5 h-3.5" />
              Checklist {loja.checklist.length > 0 && `(${loja.checklist.length})`}
            </button>
            <button onClick={() => setTab('notas')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                tab === 'notas' ? 'bg-brand-light text-white' : 'text-gray-600 hover:text-gray-400'
              }`}>
              <FileText className="w-3.5 h-3.5" />
              Notas {loja.notas.length > 0 && `(${loja.notas.length})`}
            </button>
          </div>

          {/* ── CHECKLIST ── */}
          {tab === 'checklist' && (
            <div className="space-y-2">
              {/* Input */}
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-1 rounded-xl border overflow-hidden transition-colors focus-within:border-brand-purple"
                  style={{ background: 'rgba(0,0,0,.25)', borderColor: 'rgba(255,255,255,.08)' }}>
                  <select value={tipoNovo} onChange={e => setTipoNovo(e.target.value as CheckItem['tipo'])}
                    className="bg-transparent text-[10px] font-bold pl-2.5 py-2.5 outline-none cursor-pointer shrink-0"
                    style={{ color: TIPO_CONFIG[tipoNovo].color }}>
                    <option value="tarefa">Tarefa</option>
                    <option value="demanda">Demanda</option>
                    <option value="alinhamento">Alinhamento</option>
                  </select>
                  <div className="w-px h-4 bg-white/10 shrink-0" />
                  <input value={novoItem} onChange={e => setNovoItem(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddItem()}
                    placeholder="Adicionar item..."
                    className="flex-1 bg-transparent px-2 py-2.5 text-sm text-white placeholder-gray-700 outline-none min-w-0" />
                </div>
                <button onClick={handleAddItem} disabled={!novoItem.trim()}
                  className="w-9 rounded-xl bg-brand-purple text-white flex items-center justify-center hover:bg-brand-purple/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 cursor-pointer">
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Lista */}
              {loja.checklist.length === 0 ? (
                <p className="text-xs text-gray-700 text-center py-5 italic">
                  Adicione tarefas, demandas ou alinhamentos acima.
                </p>
              ) : (
                <div className="space-y-1.5">
                  {loja.checklist.filter(i => !i.feito).map(i => (
                    <ChecklistItem key={i.id} item={i}
                      onToggle={() => gestao.toggleItem(groupId, storeId, i.id)}
                      onDelete={() => gestao.deleteItem(groupId, storeId, i.id)}
                      onEdit={t => gestao.editItem(groupId, storeId, i.id, t)} />
                  ))}
                  {loja.checklist.filter(i => i.feito).length > 0 && (
                    <>
                      <p className="text-[9px] text-gray-700 uppercase tracking-widest px-1 pt-1">Concluídos</p>
                      {loja.checklist.filter(i => i.feito).map(i => (
                        <ChecklistItem key={i.id} item={i}
                          onToggle={() => gestao.toggleItem(groupId, storeId, i.id)}
                          onDelete={() => gestao.deleteItem(groupId, storeId, i.id)}
                          onEdit={t => gestao.editItem(groupId, storeId, i.id, t)} />
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── NOTAS ── */}
          {tab === 'notas' && (
            <div className="space-y-2">
              {!addingNota ? (
                <button onClick={() => setAddingNota(true)}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border border-dashed text-xs text-gray-600 hover:text-gray-400 hover:border-gray-600 transition-all cursor-pointer"
                  style={{ borderColor: 'rgba(255,255,255,.08)' }}>
                  <Plus className="w-3.5 h-3.5" /> Nova nota / ata de reunião
                </button>
              ) : (
                <div className="space-y-2 p-3 rounded-xl border"
                  style={{ background: 'rgba(255,255,255,.02)', borderColor: 'rgba(255,255,255,.07)' }}>
                  <input value={novaNota.titulo} onChange={e => setNovaNota(p => ({ ...p, titulo: e.target.value }))}
                    autoFocus
                    placeholder="Título (ex: Reunião 22/05, Alinhamento cliente...)"
                    className="w-full rounded-lg px-3 py-2 text-sm font-semibold text-white placeholder-gray-700 outline-none border transition-colors focus:border-brand-purple"
                    style={{ background: 'rgba(0,0,0,.3)', borderColor: 'rgba(255,255,255,.08)' }} />
                  <textarea value={novaNota.conteudo} onChange={e => setNovaNota(p => ({ ...p, conteudo: e.target.value }))}
                    placeholder="Descreva o que foi alinhado, decisões, próximos passos..."
                    rows={4}
                    className="w-full rounded-lg px-3 py-2 text-sm text-gray-300 placeholder-gray-700 outline-none resize-none leading-relaxed border transition-colors focus:border-brand-purple"
                    style={{ background: 'rgba(0,0,0,.3)', borderColor: 'rgba(255,255,255,.08)' }} />
                  <div className="flex gap-2">
                    <button onClick={handleAddNota} disabled={!novaNota.titulo.trim()}
                      className="px-4 py-1.5 rounded-lg bg-brand-purple text-white text-xs font-bold hover:bg-brand-purple/90 transition-all disabled:opacity-40 cursor-pointer">
                      Salvar nota
                    </button>
                    <button onClick={() => { setAddingNota(false); setNovaNota({ titulo: '', conteudo: '' }); }}
                      className="px-4 py-1.5 rounded-lg text-gray-500 text-xs hover:text-gray-300 transition-all cursor-pointer"
                      style={{ background: 'rgba(255,255,255,.05)' }}>
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {/* Filtro de Período mensal */}
              {loja.notas.length > 0 && !addingNota && (
                <div className="flex items-center justify-between gap-1.5 px-1 py-1 border-b border-white/5 pb-2">
                  <span className="text-[10px] text-gray-500 font-bold uppercase">Período</span>
                  <select 
                    value={selectedMonth} 
                    onChange={e => setSelectedMonth(e.target.value)}
                    className="bg-[#12121a] border border-white/5 rounded-lg px-2 py-1 text-[10px] font-bold text-gray-400 outline-none focus:border-brand-purple cursor-pointer hover:text-white transition-colors"
                  >
                    <option value="all">Ver todos os meses</option>
                    {getNotesByMonth(loja.notas).map(m => (
                      <option key={m.key} value={m.key}>{m.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {loja.notas.length === 0 && !addingNota ? (
                <p className="text-xs text-gray-700 text-center py-5 italic">
                  Nenhuma nota. Registre atas e alinhamentos.
                </p>
              ) : (
                <div className="space-y-4">
                  {(selectedMonth === 'all' 
                    ? getNotesByMonth(loja.notas) 
                    : getNotesByMonth(loja.notas).filter(m => m.key === selectedMonth)
                  ).map(monthGroup => (
                    <div key={monthGroup.key} className="space-y-2">
                      <div className="flex items-center gap-1.5 px-1">
                        <span className="text-[9px] uppercase tracking-wider font-extrabold text-gray-500 bg-white/5 px-2 py-0.5 rounded-sm">{monthGroup.label}</span>
                        <div className="flex-1 h-px bg-white/5" />
                        <span className="text-[9px] text-gray-600 font-medium">({monthGroup.items.length})</span>
                      </div>
                      <div className="space-y-2">
                        {monthGroup.items.map(n => (
                          <NotaCard 
                            key={n.id} 
                            nota={n}
                            onUpdate={p => gestao.updateNota(groupId, storeId, n.id, p)}
                            onDelete={() => gestao.deleteNota(groupId, storeId, n.id)}
                            onSelect={() => onSelectNota(n, storeId, storeName, color)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                  {loja.notas.length > 0 && selectedMonth !== 'all' && getNotesByMonth(loja.notas).filter(m => m.key === selectedMonth).length === 0 && (
                    <p className="text-xs text-gray-700 text-center py-5 italic">
                      Nenhuma nota encontrada para este período.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface NotaDetailModalProps {
  nota: Nota;
  storeName: string;
  storeColor: string;
  onClose: () => void;
  onUpdate: (p: Partial<Nota>) => void;
  onDelete: () => void;
}

function NotaDetailModal({ nota, storeName, storeColor, onClose, onUpdate, onDelete }: NotaDetailModalProps) {
  const [editing, setEditing] = useState(false);
  const [titulo, setTitulo] = useState(nota.titulo);
  const [conteudo, setConteudo] = useState(nota.conteudo);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const handleSave = () => {
    if (titulo.trim()) {
      onUpdate({ titulo: titulo.trim(), conteudo: conteudo.trim() });
      setEditing(false);
    }
  };

  return (
    <>
      {/* Upper Backdrop */}
      <div 
        className="fixed inset-0 bg-black/85 z-[100] backdrop-blur-md animate-[fade-in_150ms_ease-out]" 
        onClick={onClose} 
      />
      
      {/* Modal Dialog */}
      <div 
        className="fixed inset-x-4 top-[8%] md:top-[12%] max-w-2xl mx-auto bg-[#08080c] border border-white/10 rounded-2xl z-[101] shadow-2xl flex flex-col overflow-hidden max-h-[80vh] animate-[scale-up_200ms_ease-out]"
      >
        {/* Visual Category Border Line */}
        <div className="h-1.5 w-full shrink-0" style={{ backgroundColor: storeColor }} />
        
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: storeColor }} />
            <span className="text-xs font-black tracking-wider uppercase text-gray-500">{storeName} · Ata de Alinhamento</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-600 mb-1">Título do Instrumento / Ata</label>
                <input 
                  value={titulo} 
                  onChange={e => setTitulo(e.target.value)}
                  className="w-full bg-[#12121a] border border-brand-purple rounded-xl px-4 py-2.5 text-sm font-bold text-white outline-none focus:ring-1 focus:ring-brand-purple" 
                  placeholder="Ex: Reunião Geral de Alinhamento 20/05"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-600 mb-1">Atas de Reunião, Decisões & Informações Importantes</label>
                <textarea 
                  value={conteudo} 
                  onChange={e => setConteudo(e.target.value)} 
                  rows={9}
                  className="w-full bg-[#12121a] border border-white/5 focus:border-brand-purple rounded-xl px-4 py-3 text-sm text-gray-200 outline-none resize-none leading-relaxed" 
                  placeholder="Descreva detalhadamente o que foi conversado, as decisões tomadas e os próximos passos definidos nessa ata..."
                />
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <h1 className="text-xl md:text-2xl font-black text-white leading-snug whitespace-normal break-words selection:bg-brand-purple/35">{nota.titulo}</h1>
              
              <div className="flex items-center gap-4 text-[10px] text-gray-500 border-y border-white/5 py-2.5 shrink-0 uppercase tracking-widest font-semibold">
                <div>
                  <span className="text-gray-700 font-bold">Criação:</span> {new Date(nota.criadoEm).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
                {nota.criadoEm !== nota.atualizadoEm && (
                  <div>
                    <span className="text-gray-700 font-bold">Último ajuste:</span> {new Date(nota.atualizadoEm).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </div>

              <div className="text-sm md:text-base text-gray-300 leading-relaxed whitespace-pre-wrap py-2 font-normal select-text selection:bg-brand-purple/35 selection:text-white break-words">
                {nota.conteudo || (
                  <span className="text-gray-700 italic">
                    Nenhum conteúdo textual fornecido. Clique em Editar Nota abaixo para começar a detalhar as minúcias desse compromisso.
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="px-6 py-4 border-t border-white/5 bg-[#050508] shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {editing ? (
              <>
                <button 
                  onClick={handleSave}
                  disabled={!titulo.trim()}
                  className="px-4 py-2 bg-brand-purple text-white rounded-xl text-xs font-bold hover:bg-brand-purple/90 transition-all cursor-pointer disabled:opacity-40"
                >
                  Salvar
                </button>
                <button 
                  onClick={() => { setEditing(false); setTitulo(nota.titulo); setConteudo(nota.conteudo); }}
                  className="px-4 py-2 text-gray-500 text-xs hover:text-white transition-all cursor-pointer"
                >
                  Cancelar
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl text-xs font-bold transition-all border border-white/10 cursor-pointer flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5 text-gray-500" /> Editar
                </button>
                
                {confirmingDelete ? (
                  <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-xl">
                    <span className="text-[10px] font-bold text-red-400">Excluir permanentemente?</span>
                    <button 
                      onClick={onDelete}
                      className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[9px] font-bold transition-all cursor-pointer"
                    >
                      Sim
                    </button>
                    <button 
                      onClick={() => setConfirmingDelete(false)}
                      className="px-2 py-1 text-gray-400 hover:text-white rounded-lg text-[9px] font-bold transition-all cursor-pointer"
                    >
                      Não
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setConfirmingDelete(true)}
                    className="px-4 py-2 text-red-500/80 hover:text-red-400 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-800" /> Excluir
                  </button>
                )}
              </>
            )}
          </div>
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-400 hover:text-white border border-white/10 rounded-xl transition-all cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </>
  );
}

// ── Painel principal ──────────────────────────────────────────────────────────
interface Props {
  group: GroupData;
  onClose: () => void;
}

export function GestaoPanel({ group, onClose }: Props) {
  const gestao = useGestao();

  const [selectedNota, setSelectedNota] = useState<{
    nota: Nota;
    storeId: string;
    storeName: string;
    storeColor: string;
  } | null>(null);

  const [muralSelectedMonth, setMuralSelectedMonth] = useState<string>('all');

  const handleSelectNota = (nota: Nota, storeId: string, storeName: string, storeColor: string) => {
    setSelectedNota({ nota, storeId, storeName, storeColor });
  };

  // Coleta todas as notas de todas as lojas deste grupo ordenadas por mais nova primeiro
  const todasNotas = group.stores.flatMap(store => {
    const storeData = gestao.getLoja(group.id, store.id, store.name);
    return storeData.notas.map(nota => ({
      ...nota,
      storeId: store.id,
      storeName: store.name,
      storeColor: store.color
    }));
  }).sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime());

  // Agrupa as notas consolidadas por meses de criação
  const grupoMonths = getNotesByMonth(todasNotas);

  const muralFilteredMonthGroups = muralSelectedMonth === 'all'
    ? grupoMonths
    : grupoMonths.filter(m => m.key === muralSelectedMonth);

  // Fechar com Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  // Stats do grupo
  const stats = gestao.statsGrupo(group.id, group.stores.map(s => ({ id: s.id, name: s.name })));
  const progresso = stats.total > 0 ? Math.round((stats.feitas / stats.total) * 100) : 0;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/75 z-40 backdrop-blur-sm" onClick={onClose} />

      {/* Mural Esquerdo Consolidado (Desktop) */}
      <div 
        className="fixed inset-y-0 left-0 right-[32rem] hidden lg:flex flex-col p-10 z-50 overflow-y-auto cursor-pointer"
        onClick={onClose}
      >
        <div className="w-full max-w-5xl mx-auto space-y-6 cursor-default" onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="flex items-end justify-between border-b border-white/5 pb-4">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-brand-purple uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-purple animate-pulse" />
                Painel Consolidado de Atividades
              </div>
              <h2 className="text-2xl font-black text-white mt-1.5 flex items-center gap-2">
                <Notebook className="w-5 h-5" style={{ color: group.color }} />
                Mural Integrado: {group.name}
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Todas as tarefas e notas de reuniões de todas as contas consolidadas em tempo real.
              </p>
            </div>
            <button 
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all cursor-pointer"
            >
              Fechar Painel (Esc)
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
            {/* Coluna Checklists ativas de todas as lojas */}
            <div className="bg-brand-medium/40 border border-white/5 rounded-2xl p-5 space-y-4 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <ListChecks className="w-4 h-4 text-brand-purple" />
                  <h3 className="text-sm font-bold text-white">Tarefas & Demandas Pendentes</h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  {stats.pendentes} pendentes
                </span>
              </div>

              <div className="space-y-4 max-h-[64vh] overflow-y-auto pr-1">
                {group.stores.map(store => {
                  const storeData = gestao.getLoja(group.id, store.id, store.name);
                  const pendentes = storeData.checklist.filter(i => !i.feito);
                  
                  if (pendentes.length === 0) return null;

                  return (
                    <div key={store.id} className="space-y-2 border-l-2 pl-3" style={{ borderColor: store.color }}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-white py-0.5">{store.name}</span>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: store.color }} />
                      </div>
                      <div className="space-y-1.5">
                        {pendentes.map(item => (
                          <ChecklistItem 
                            key={item.id} 
                            item={item}
                            onToggle={() => gestao.toggleItem(group.id, store.id, item.id)}
                            onDelete={() => gestao.deleteItem(group.id, store.id, item.id)}
                            onEdit={t => gestao.editItem(group.id, store.id, item.id, t)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}

                {stats.pendentes === 0 && (
                  <div className="text-center py-12 text-gray-600 italic text-xs">
                    Nenhuma tarefa pendente! Adicione novas tarefas no feed de cada loja à direita.
                  </div>
                )}
              </div>
            </div>

            {/* Coluna Anotações / Atas de todas as lojas */}
            <div className="bg-brand-medium/50 border border-white/5 rounded-2xl p-5 space-y-4 backdrop-blur-md">
              <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-3">
                <div className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#10b981]" />
                  <h3 className="text-sm font-bold text-white">Notas, Atas & Compromissos</h3>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/15">
                  {stats.notas} total
                </span>
              </div>

              {/* Filtro do Mural Consolidado */}
              {todasNotas.length > 0 && (
                <div className="flex items-center justify-between gap-1.5 bg-[#0e0e16] px-3.5 py-2 rounded-xl border border-white/5">
                  <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wide">Selecionar Mês</span>
                  <select 
                    value={muralSelectedMonth} 
                    onChange={e => setMuralSelectedMonth(e.target.value)}
                    className="bg-[#08080c] border border-white/10 rounded-lg px-2.5 py-1 text-xs font-bold text-gray-200 outline-none focus:border-brand-purple cursor-pointer hover:text-white transition-colors"
                  >
                    <option value="all">Todo o histórico do grupo</option>
                    {grupoMonths.map(m => (
                      <option key={m.key} value={m.key}>{m.label}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-6 max-h-[58vh] overflow-y-auto pr-1">
                {muralFilteredMonthGroups.map(monthGroup => (
                  <div key={monthGroup.key} className="space-y-3">
                    <div className="flex items-center gap-2 sticky top-0 bg-[#0c0c14]/90 py-1 z-10 backdrop-blur-xs">
                      <span className="text-[9px] uppercase font-black tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                        {monthGroup.label}
                      </span>
                      <div className="flex-1 h-px bg-white/5" />
                      <span className="text-[9px] text-gray-600 font-bold">({monthGroup.items.length})</span>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {monthGroup.items.map(n => (
                        <div key={n.id} className="relative group/card">
                          {/* Store tag left border strip */}
                          <div className="absolute top-0 bottom-0 left-0 w-1 rounded-l-xl" style={{ backgroundColor: n.storeColor }} />
                          <div className="pl-1.5">
                            <NotaCard 
                              nota={n}
                              onUpdate={p => gestao.updateNota(group.id, n.storeId, n.id, p)}
                              onDelete={() => gestao.deleteNota(group.id, n.storeId, n.id)}
                              onSelect={() => handleSelectNota(n, n.storeId, n.storeName, n.storeColor)}
                            />
                            {/* Short Store label under card */}
                            <div className="flex items-center gap-1.5 mt-1 px-3">
                              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: n.storeColor }} />
                              <span className="text-[9px] font-black tracking-wide text-gray-500 uppercase">{n.storeName}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {todasNotas.length === 0 && (
                  <div className="text-center py-12 text-gray-600 italic text-xs">
                    Nenhuma nota registrada! Crie notas e atas nas lojas do painel à direita.
                  </div>
                )}

                {todasNotas.length > 0 && muralFilteredMonthGroups.length === 0 && (
                  <div className="text-center py-12 text-gray-600 italic text-xs">
                    Nenhuma nota registrada no período selecionado.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full z-50 w-full max-w-lg flex flex-col shadow-2xl"
        style={{ background: '#09090f', borderLeft: '1px solid rgba(255,255,255,.07)' }}>

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b shrink-0"
          style={{ borderColor: 'rgba(255,255,255,.07)' }}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `${group.color}20`, border: `1px solid ${group.color}30` }}>
            <Notebook className="w-4 h-4" style={{ color: group.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white">{group.name}</p>
            <p className="text-[10px] text-gray-600">{group.stores.length} lojas · Checklist e anotações</p>
          </div>
          <button onClick={onClose}
            className="p-2 rounded-xl text-gray-600 hover:text-white hover:bg-white/5 transition-all cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stats */}
        <div className="px-5 py-3 border-b shrink-0" style={{ borderColor: 'rgba(255,255,255,.04)' }}>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {[
              { label: 'Total',     val: stats.total,     c: '#9ca3af' },
              { label: 'Feitas',    val: stats.feitas,    c: '#22c55e' },
              { label: 'Pendentes', val: stats.pendentes, c: stats.pendentes > 0 ? '#f59e0b' : '#9ca3af' },
              { label: 'Notas',     val: stats.notas,     c: '#a78bfa' },
            ].map(s => (
              <div key={s.label} className="text-center py-2.5 rounded-xl"
                style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.04)' }}>
                <p className="text-lg font-bold leading-none mb-1" style={{ color: s.c }}>{s.val}</p>
                <p className="text-[8px] text-gray-700 uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>

          {stats.total > 0 && (
            <div>
              <div className="flex justify-between text-[9px] text-gray-700 mb-1">
                <span>Progresso geral</span>
                <span style={{ color: progresso === 100 ? '#22c55e' : '#9ca3af' }}>{progresso}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,.06)' }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${progresso}%`, background: progresso === 100 ? '#22c55e' : group.color }} />
              </div>
            </div>
          )}
        </div>

        {/* Lojas */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {group.stores.length === 0 ? (
            <p className="text-sm text-gray-600 text-center py-12 italic">
              Nenhuma loja cadastrada neste grupo.
            </p>
          ) : (
            group.stores.map(store => (
              <LojaPanel
                key={store.id}
                groupId={group.id}
                storeId={store.id}
                storeName={store.name}
                color={store.color}
                gestao={gestao}
                onSelectNota={handleSelectNota}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 border-t shrink-0 flex items-center gap-2"
          style={{ borderColor: 'rgba(255,255,255,.05)' }}>
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <p className="text-[9px] text-gray-700">Salvo automaticamente · Pressione Esc para fechar</p>
        </div>
      </div>

      {selectedNota && (
        <NotaDetailModal
          nota={selectedNota.nota}
          storeName={selectedNota.storeName}
          storeColor={selectedNota.storeColor}
          onClose={() => setSelectedNota(null)}
          onUpdate={p => {
            gestao.updateNota(group.id, selectedNota.storeId, selectedNota.nota.id, p);
            setSelectedNota(prev => prev ? { ...prev, nota: { ...prev.nota, ...p, atualizadoEm: new Date().toISOString() } } : null);
          }}
          onDelete={() => {
            gestao.deleteNota(group.id, selectedNota.storeId, selectedNota.nota.id);
            setSelectedNota(null);
          }}
        />
      )}
    </>
  );
}
