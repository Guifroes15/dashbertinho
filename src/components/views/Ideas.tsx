import React from 'react';
import { IDEAS } from '../../data';
import { Sparkles, Zap, Palette, Layers, ArrowRight } from 'lucide-react';

export function IdeasView() {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <header className="mb-8 md:mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 flex items-center gap-3 text-[var(--text-primary)]">
          <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-brand-purple" />
          Ideias & Estratégias
        </h1>
        <p className="text-xs md:text-sm text-[var(--text-secondary)] font-medium tracking-wide leading-relaxed">
          Conceitos estratégicos para aumentar a conversão nas próximas campanhas.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {IDEAS.map((idea) => (
          <div 
            key={idea.id} 
            className="bg-brand-medium border border-brand-light rounded-2xl p-6 md:p-8 hover:border-brand-purple transition-all duration-300 relative group overflow-hidden"
          >
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-purple opacity-5 blur-3xl group-hover:opacity-10 transition-opacity" />
            
            <div className="relative z-10">
              <h3 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                {idea.title}
              </h3>
              <p className="text-[var(--text-muted)] leading-relaxed mb-8 text-sm">
                {idea.description}
              </p>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-brand-purple-light text-[10px] font-bold uppercase tracking-widest mb-3">
                    <Zap className="w-3 h-3" />
                    Fluxo de Conversão
                  </div>
                  <div className="bg-brand-dark/50 border border-brand-light/20 p-4 rounded-xl text-xs md:text-sm font-medium text-[var(--text-secondary)] flex items-center gap-2">
                    {idea.fluxo}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center gap-2 text-brand-purple-light text-[10px] font-bold uppercase tracking-widest mb-3">
                      <Palette className="w-3 h-3" />
                      Visual
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {idea.temas?.map((tema, i) => (
                        <span key={i} className="px-2 py-1 bg-brand-light/30 rounded text-[10px] text-[var(--text-muted)] font-medium">
                          {tema}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-brand-purple-light text-[10px] font-bold uppercase tracking-widest mb-3">
                      <Layers className="w-3 h-3" />
                      Componentes
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {idea.elementos?.map((el, i) => (
                        <span key={i} className="px-2 py-1 bg-brand-light/30 rounded text-[10px] text-[var(--text-muted)] font-medium">
                          {el}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {idea.url && (
                <a 
                  href={idea.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-8 w-full py-3 bg-brand-purple hover:bg-brand-purple-light text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  Ver Página Live
                  <ArrowRight className="w-4 h-4" />
                </a>
              )}

              {!idea.url && (
                <button className="mt-8 w-full py-3 bg-brand-purple hover:bg-brand-purple-light text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2">
                  Solicitar Protótipo
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 p-8 bg-brand-light/10 border border-brand-light rounded-2xl">
        <h4 className="font-bold mb-2 text-[var(--text-primary)]">Por que investir nessas subpáginas?</h4>
        <p className="text-sm text-[var(--text-muted)] leading-relaxed">
          Páginas focadas em um único objetivo (Dia dos Namorados ou Entrada no VIP) eliminam as distrações do site principal. 
          Ao oferecer um "Guia" ou uma "Experiência Exclusiva", aumentamos o valor percebido pelo cliente antes mesmo dele 
          clicar no botão do WhatsApp, o que resulta em leads muito mais qualificados para os seus vendedores.
        </p>
      </div>
    </div>
  );
}
