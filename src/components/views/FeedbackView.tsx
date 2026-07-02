import React from 'react';
import { StoreData } from '../../types';
import { ultimoMes, formatBRL } from '../../utils';
import { MessageSquare, ThumbsUp, AlertCircle, TrendingDown, Target, Zap, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  stores: StoreData[];
  onStoreClick: (id: string) => void;
}

export function FeedbackView({ stores, onStoreClick }: Props) {
  const getFeedback = (store: StoreData) => {
    const u = ultimoMes(store);
    const prev = store.historico[store.historico.length - 2];
    
    const tips: { type: 'success' | 'warning' | 'alert' | 'idea'; text: string; icon: React.ElementType }[] = [];

    if (!u || u.vendas === 0) {
      tips.push({ 
        type: 'alert', 
        text: 'Loja sem resultados no último mês. Urgente: revisar se houve disparos ou se os dados estão corretos.', 
        icon: AlertCircle 
      });
      return tips;
    }

    // Conversão
    if (u.conversao > 15) {
      tips.push({ 
        type: 'success', 
        text: `Excelente taxa de conversão (${u.conversao.toFixed(1)}%). O time de vendas está convertendo leads com alta eficiência.`, 
        icon: ThumbsUp 
      });
    } else if (u.conversao < 5 && u.mensagens > 100) {
      tips.push({ 
        type: 'alert', 
        text: `Conversão baixa (${u.conversao.toFixed(1)}%) para o volume de mensagens (${u.mensagens}). Revisar abordagem do time de vendas ou qualidade do lead.`, 
        icon: TrendingDown 
      });
    }

    // Ticket Médio
    if (prev && u.ticketMedio < prev.ticketMedio * 0.8) {
      tips.push({ 
        type: 'warning', 
        text: `Queda brusca no Ticket Médio (de ${formatBRL(prev.ticketMedio)} para ${formatBRL(u.ticketMedio)}). Avaliar se o foco mudou para produtos mais baratos.`, 
        icon: Target 
      });
    }

    // Volume vs Faturamento
    if (u.pctAureFat > 8) {
      tips.push({ 
        type: 'idea', 
        text: `Operação Aure representa ${u.pctAureFat.toFixed(1)}% do faturamento total. Recomendar aumento de verba para escalar esse canal que já provou ROI.`, 
        icon: Zap 
      });
    }

    // Generico se tiver nada
    if (tips.length === 0) {
      tips.push({ 
        type: 'idea', 
        text: 'Performance estável. Sugerir teste A/B de criativos para tentar elevar o Ticket Médio.', 
        icon: Target 
      });
    }

    return tips;
  };

  return (
    <div className="animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="text-2xl lg:text-4xl font-extrabold tracking-tight mb-2 text-[var(--text-primary)]">
          Feedback Hub
        </h1>
        <p className="text-xs lg:text-sm text-[var(--text-secondary)]">
          Dicas automáticas baseadas nos resultados para facilitar seus reports semanais.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {stores.map((store, i) => {
          const tips = getFeedback(store);
          return (
            <motion.div
              key={store.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-brand-medium border border-brand-light rounded-2xl overflow-hidden group hover:border-brand-purple/40 transition-all shadow-xl"
            >
              <div className="p-5 border-b border-brand-light flex items-center justify-between bg-white/[0.01]">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.4)]" style={{ background: store.color }} />
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">{store.name}</h3>
                </div>
                <button 
                  onClick={() => onStoreClick(store.id)}
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-brand-purple transition-colors"
                >
                  Ver Detalhes <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {tips.map((tip, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-start gap-4 p-4 rounded-xl border ${
                      tip.type === 'success' ? 'bg-green-500/5 border-green-500/20 text-green-200' :
                      tip.type === 'alert' ? 'bg-red-500/5 border-red-500/20 text-red-200' :
                      tip.type === 'warning' ? 'bg-orange-500/5 border-orange-500/20 text-orange-200' :
                      'bg-brand-purple/5 border-brand-purple/20 text-brand-purple2'
                    }`}
                  >
                    <div className="mt-1">
                      <tip.icon className="w-5 h-5 opacity-80" />
                    </div>
                    <p className="text-sm font-medium leading-relaxed">
                      {tip.text}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
