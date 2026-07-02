import React from 'react';
import { Store } from 'lucide-react';
import { GroupData } from '../../types';

interface Props {
  group: GroupData;
}

export function EmptyGroupView({ group }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="w-20 h-20 bg-brand-light rounded-2xl flex items-center justify-center mb-6 border border-brand-light">
        <Store className="w-10 h-10 text-[var(--text-muted)]" />
      </div>
      <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">{group.name}</h2>
      <p className="text-[var(--text-secondary)] max-w-sm">
        Este grupo ainda não possui lojas cadastradas. Envie as DREs para começar a análise.
      </p>
      
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
        {[
          { label: 'Envio de DRE', desc: 'Processamento automático' },
          { label: 'Análise de ROI', desc: 'Cálculo por loja' },
          { label: 'Projeção', desc: 'Estimativa de faturamento' },
        ].map((feat, i) => (
          <div key={i} className="bg-brand-medium border border-brand-light rounded-xl p-4 text-left">
            <p className="text-[10px] font-bold text-brand-purple uppercase tracking-widest mb-1">{feat.label}</p>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">{feat.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
