import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { GroupData } from '../../types';

interface Props {
  group: GroupData;
  onEnter: () => void;
}

export function ClientHomeView({ group, onEnter }: Props) {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 relative">
      
      {/* Decorative center glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-brand-purple/5 blur-[80px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 max-w-2xl"
      >
        <div className="w-16 h-16 bg-brand-light rounded-2xl flex items-center justify-center mb-8 mx-auto border border-brand-light">
          <TrendingUp className="w-8 h-8 text-brand-purple" />
        </div>

        <h3 className="text-sm font-bold uppercase tracking-[0.3em] text-[var(--text-secondary)] mb-6">
          Operação {group.name}
        </h3>
        
        <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.1] mb-12 text-[var(--text-primary)]">
          Sua performance operacional elevada ao próximo nível.
        </h1>

        <button 
          onClick={onEnter}
          className="group flex items-center gap-4 px-10 py-5 bg-brand-purple hover:bg-brand-purple/90 text-white rounded-3xl font-bold text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-brand-purple/20"
        >
          Acessar Dashboard Completo
          <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
        </button>

        <p className="mt-24 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.4em]">
          Powered by Aure Digital Intelligence
        </p>
      </motion.div>
    </div>
  );
}
