import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, TrendingUp, Zap, Target, BarChart3 } from 'lucide-react';

interface Props {
  onEnter: () => void;
}

export function LandingPage({ onEnter }: Props) {
  return (
    <div className="min-h-screen bg-[#070708] text-white selection:bg-brand-purple selection:text-white overflow-hidden font-sans relative flex flex-col">
      
      {/* Cinematic Background Lighting */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[10%] right-[5%] w-[60vw] h-[60vw] bg-brand-purple/10 blur-[150px] rounded-full opacity-60" />
        <div className="absolute bottom-[0%] left-[-10%] w-[50vw] h-[50vw] bg-orange-600/10 blur-[150px] rounded-full opacity-30" />
        <div className="absolute top-[40%] left-[20%] w-[40vw] h-[40vw] bg-blue-600/5 blur-[120px] rounded-full" />
      </div>

      {/* Top Navigation */}
      <nav className="relative z-50 px-8 py-8 md:px-16 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-brand-purple" />
          <span className="text-xl font-black tracking-tighter uppercase italic">Aure Digital</span>
        </div>
        <button 
          onClick={onEnter}
          className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 hover:text-white transition-all"
        >
          Acessar Dashboard <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
        </button>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col justify-center px-8 md:px-16 max-w-[1400px] mx-auto w-full">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Headline - Cinematic Style */}
          <motion.div 
            className="lg:col-span-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="h-[2px] w-8 bg-brand-purple" />
              <span className="text-[10px] font-black text-brand-purple uppercase tracking-[0.5em]">Intelligence Agency</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.82] mb-10">
              BUILDING <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/40">BRANDS THAT</span> <br />
              <span className="italic text-brand-purple">STAND OUT.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-500 mb-12 max-w-xl leading-tight font-medium">
              Transformamos dados em decisões estratégicas.
              Uma central exclusiva de performance para os maiores grupos de varejo.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-8 items-start">
              <button 
                onClick={onEnter}
                className="group relative px-12 py-6 bg-white text-black rounded-full font-black text-xs uppercase tracking-[0.3em] flex items-center gap-4 transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-white/5 overflow-hidden"
              >
                <span className="relative z-10">Start Dashboard</span>
                <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-brand-purple translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              </button>
              
              <div className="pt-2">
                <p className="text-[9px] font-bold text-gray-700 uppercase tracking-[0.5em] mb-2">Powered By</p>
                <div className="flex items-center gap-4 grayscale opacity-40">
                  <span className="text-xs font-black">YAMCOL</span>
                  <span className="text-xs font-black">BARBOSA</span>
                  <span className="text-xs font-black">PARALELAS</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Side Stats - Compact & High-End */}
          <motion.div 
            className="lg:col-span-4 space-y-4"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group hover:border-brand-purple/30 transition-colors">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <BarChart3 className="w-32 h-32" />
              </div>
              <p className="text-4xl font-black mb-1">R$ 42M+</p>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Faturamento Gerido</p>
            </div>

            <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group hover:border-brand-purple/30 transition-colors">
              <p className="text-4xl font-black mb-1">122+</p>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Lojas Monitoradas</p>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-8 py-10 md:px-16 flex justify-between items-center text-[8px] font-black uppercase tracking-[0.6em] text-gray-800">
        <span>Aure Digital © 2026</span>
        <div className="flex items-center gap-2">
          <div className="w-1 h-1 rounded-full bg-brand-purple animate-ping" />
          <span>Sistemas Online</span>
        </div>
      </footer>
    </div>
  );
}

