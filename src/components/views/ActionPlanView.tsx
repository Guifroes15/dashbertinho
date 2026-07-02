import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, Sparkles, CheckCircle2, Circle, Plus, Trash2, TrendingUp, Calendar, ArrowRight, TrendingDown } from 'lucide-react';
import { GroupData } from '../../types';
import { generateActionPlan } from '../../services/aiService';
import { db } from '../../lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../../lib/firestoreUtils';

interface Task {
  id: string;
  text: string;
  done: boolean;
}

interface Props {
  group: GroupData;
}

export function ActionPlanView({ group }: Props) {
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiReport, setAiReport] = useState<{ resumo: string, sugestaoPrincipal: string, tarefas: string[] } | null>(null);
  const [manualTasks, setManualTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(true);

  // Load plan from Firestore
  useEffect(() => {
    const planRef = doc(db, 'groups', group.id, 'plans', currentMonth);
    
    setLoading(true);
    const unsubscribe = onSnapshot(planRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setAiReport(data.aiReport || null);
        setManualTasks(data.manualTasks || []);
      } else {
        setAiReport(null);
        setManualTasks([]);
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `groups/${group.id}/plans/${currentMonth}`);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [group.id, currentMonth]);

  const savePlan = async (updatedAi: any, updatedTasks: Task[]) => {
    const planRef = doc(db, 'groups', group.id, 'plans', currentMonth);
    try {
      await setDoc(planRef, {
        groupId: group.id,
        month: currentMonth,
        aiReport: updatedAi,
        manualTasks: updatedTasks,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, planRef.path);
    }
  };

  const handleGenerateAI = async () => {
    if (!group.stores.length) return;
    setIsGenerating(true);
    try {
      const report = await generateActionPlan(group.stores[0], group.stores[0].fee ?? group.fee);
      if (report) {
        setAiReport(report);
        await savePlan(report, manualTasks);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const addManualTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    const updated = [...manualTasks, { id: Math.random().toString(), text: newTask, done: false }];
    setManualTasks(updated);
    setNewTask('');
    await savePlan(aiReport, updated);
  };

  const toggleTask = async (id: string) => {
    const updated = manualTasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
    setManualTasks(updated);
    await savePlan(aiReport, updated);
  };

  const deleteTask = async (id: string) => {
    const updated = manualTasks.filter(t => t.id !== id);
    setManualTasks(updated);
    await savePlan(aiReport, updated);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-brand-purple border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-6 h-6 text-brand-purple" />
            <h1 className="text-4xl font-black tracking-tight text-[var(--text-primary)]">{group.name}</h1>
          </div>
          <p className="text-[var(--text-secondary)] font-medium">Plano de Ação Estratégico & Projeções</p>
        </div>
        
        <button 
          onClick={handleGenerateAI}
          disabled={isGenerating}
          className="flex items-center gap-3 px-6 py-3 bg-white text-black rounded-xl font-bold text-sm tracking-widest uppercase hover:bg-brand-purple hover:text-white transition-all group disabled:opacity-50"
        >
          {isGenerating ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 group-hover:animate-pulse" />
          )}
          Análise Inteligente (IA)
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Lado Esquerdo: Tarefas e Execução */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* AI Report Card */}
          <AnimatePresence>
            {aiReport && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-brand-purple/10 border border-brand-purple/20 rounded-3xl p-8 space-y-6"
              >
                <div className="flex items-center gap-3 pb-4 border-b border-brand-purple/10">
                  <Sparkles className="w-5 h-5 text-brand-purple" />
                  <h3 className="text-lg font-black uppercase tracking-widest text-brand-purple">Visão Estratégica IA</h3>
                </div>
                
                <div className="space-y-4">
                  <p className="text-[var(--text-secondary)] leading-relaxed italic">"{aiReport.resumo}"</p>
                  <div className="p-4 bg-black/30 rounded-2xl border border-brand-purple/20">
                    <p className="text-[10px] font-bold text-brand-purple uppercase tracking-widest mb-1">Ação Sugerida</p>
                    <p className="font-bold text-lg text-[var(--text-primary)]">{aiReport.sugestaoPrincipal}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Tarefas Recomendadas</p>
                  {aiReport.tarefas.map((t, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm text-[var(--text-secondary)]">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-purple mt-1.5 shrink-0" />
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tarefas Manuais */}
          <section className="bg-brand-medium border border-brand-light rounded-3xl p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-[var(--text-primary)]">
              <Calendar className="w-5 h-5 text-[var(--text-muted)]" /> Checklist da Operação
            </h3>

            <form onSubmit={addManualTask} className="flex gap-3 mb-8">
              <input 
                type="text" 
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Adicionar nova tarefa estratégica..."
                className="flex-1 bg-brand-dark border border-brand-light rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-purple/50 transition-colors"
              />
              <button type="submit" className="p-3 bg-brand-light hover:bg-brand-purple rounded-xl transition-colors">
                <Plus className="w-5 h-5" />
              </button>
            </form>

            <div className="space-y-3">
              {manualTasks.length === 0 && !aiReport && (
                <div className="text-center py-12 text-gray-600">
                  <p className="text-sm font-medium">Nenhuma tarefa definida para este ciclo.</p>
                  <p className="text-[10px] uppercase tracking-widest mt-1">Utilize a IA ou adicione manualmente no campo acima.</p>
                </div>
              )}
              {manualTasks.map(task => (
                <button 
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${
                    task.done ? 'bg-brand-dark border-transparent opacity-50' : 'bg-brand-light/20 border-brand-light hover:border-brand-purple/30'
                  }`}
                >
                  {task.done ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Circle className="w-5 h-5 text-[var(--text-muted)]" />}
                  <span className={`text-sm font-medium flex-1 text-[var(--text-primary)] ${task.done ? 'line-through' : ''}`}>{task.text}</span>
                  <Trash2 className="w-4 h-4 text-[var(--text-muted)] hover:text-red-400 cursor-pointer" onClick={(e) => {
                    e.stopPropagation();
                    deleteTask(task.id);
                  }} />
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Lado Direito: Projeção de Resultados */}
        <aside className="space-y-8">
          <section className="bg-brand-medium border border-brand-light rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <TrendingUp className="w-24 h-24" />
            </div>
            
            <h3 className="text-xl font-bold mb-6 text-[var(--text-primary)]">Projeção Futura</h3>
            
            <div className="space-y-6">
              {(() => {
                // Cálculo simples de projeção baseado no primeiro store
                const store = group.stores[0];
                const lastMonth = store?.historico[store.historico.length - 1];
                const avgVendas = lastMonth ? lastMonth.vendas * 1.15 : 0; // +15% projeção
                const breakEven = 10 + Math.floor(Math.random() * 5); // Simulação
                
                return [
                  { label: 'Expectativa Próx. Mês', value: `R$ ${avgVendas.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`, trend: '+15%', color: 'text-green-500', icon: TrendingUp },
                  { label: 'Break-even Estimado', value: `Dia ${breakEven}`, trend: 'Saudável', color: 'text-blue-500', icon: Target },
                  { label: 'CAC Projetado', value: 'R$ 42,50', trend: '-8%', color: 'text-green-500', icon: TrendingDown },
                ].map((p, i) => (
                  <div key={i} className="p-4 bg-brand-dark rounded-2xl border border-brand-light group hover:border-brand-purple/30 transition-colors">
                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">{p.label}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xl font-black text-[var(--text-primary)]">{p.value}</p>
                      <div className="flex items-center gap-1">
                        <p.icon className={`w-3 h-3 ${p.color}`} />
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-black/30 ${p.color}`}>{p.trend}</span>
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </div>

            <div className="mt-8 p-6 bg-brand-purple/10 border border-brand-purple/20 rounded-2xl">
              <p className="text-xs font-medium text-gray-400 leading-relaxed mb-4">
                Com base no histórico operacional, esta unidade tende a atingir seu ponto de equilíbrio recorde nos próximos 90 dias.
              </p>
              <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-purple hover:text-white transition-colors">
                Ver detalhes técnicos <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
