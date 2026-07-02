import React, { useState, useRef } from 'react';
import {
  Crown, Sparkles, Loader, RotateCcw, Copy, Check,
  RefreshCw, ChevronDown,
} from 'lucide-react';

class AnthropicMock {
  private apiKey: string;
  constructor(options: { apiKey: string; dangerouslyAllowBrowser?: boolean }) {
    this.apiKey = options.apiKey;
  }

  messages = {
    stream: (params: { model: string; max_tokens: number; messages: { role: string; content: any }[] }) => {
      const apiKey = this.apiKey;
      return {
        async *[Symbol.asyncIterator]() {
          const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'x-api-key': apiKey,
              'anthropic-version': '2023-06-01',
              'content-type': 'application/json',
              'dangerously-allow-browser': 'true',
            },
            body: JSON.stringify({
              model: params.model,
              max_tokens: params.max_tokens,
              messages: params.messages,
              stream: true,
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
          }

          const reader = response.body?.getReader();
          if (!reader) throw new Error('No body reader');

          const decoder = new TextDecoder('utf-8');
          let buffer = '';

          try {
            while (true) {
              const { value, done } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop() || '';

              for (const line of lines) {
                const cleanLine = line.trim();
                if (!cleanLine) continue;
                if (cleanLine.startsWith('data:')) {
                  const dataStr = cleanLine.slice(5).trim();
                  if (dataStr === '[DONE]') continue;
                  try {
                    const parsed = JSON.parse(dataStr);
                    if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                      yield {
                        type: 'content_block_delta',
                        delta: {
                          type: 'text_delta',
                          text: parsed.delta.text,
                        },
                      };
                    }
                  } catch (e) {
                    // ignore partial and invalid json
                  }
                }
              }
            }
          } finally {
            reader.releaseLock();
          }
        }
      };
    }
  };
}

const Anthropic = AnthropicMock as any;

// ─── Configurações ────────────────────────────────────────────────────────────
const OBJETIVOS = [
  { id: 'lancamento',   label: '🚀 Lançamento',      desc: 'Revelar produto novo ou coleção' },
  { id: 'venda',        label: '💰 Venda direta',     desc: 'Oferta com CTA para comprar agora' },
  { id: 'aquecimento',  label: '🔥 Aquecimento',      desc: 'Gerar antecipação antes do lançamento' },
  { id: 'engajamento',  label: '💬 Engajamento',      desc: 'Aumentar interação no grupo' },
  { id: 'urgencia',     label: '⏰ Urgência',         desc: 'Escassez, últimas unidades, prazo' },
  { id: 'reativacao',   label: '👋 Reativação',       desc: 'Recuperar clientes que sumiram' },
  { id: 'exclusivo',    label: '⭐ Benefício VIP',    desc: 'Mostrar vantagem exclusiva do grupo' },
  { id: 'bastidor',     label: '🎬 Bastidor',         desc: 'Conteúdo de nos bastidores da loja' },
];

const TONS = [
  { id: 'amigavel',    label: 'Amigável e próximo' },
  { id: 'animado',     label: 'Animado e empolgante' },
  { id: 'exclusivo',   label: 'Exclusivo e sofisticado' },
  { id: 'urgente',     label: 'Urgente e direto' },
  { id: 'storytelling',label: 'Storytelling emocional' },
];

const NICHOS = [
  'Moda feminina', 'Calçados', 'Moda masculina', 'Cosméticos',
  'Lingerie', 'Infantil', 'Acessórios', 'Outro',
];

interface MensagemGerada {
  mensagens: {
    versao: string;
    tom_usado: string;
    texto: string;
    dica: string;
    melhor_horario: string;
  }[];
  dicas_gerais: string[];
  emojis_sugeridos: string[];
  variacao_curta: string;
}

export function VipView() {
  const [objetivo, setObjetivo]     = useState('');
  const [tom, setTom]               = useState('');
  const [nicho, setNicho]           = useState('');
  const [produto, setProduto]       = useState('');
  const [extras, setExtras]         = useState('');
  const [loading, setLoading]       = useState(false);
  const [resultado, setResultado]   = useState<MensagemGerada | null>(null);
  const [streamText, setStream]     = useState('');
  const [copied, setCopied]         = useState<string | null>(null);
  const [expanded, setExpanded]     = useState<number | null>(0);
  const resultRef = useRef<HTMLDivElement>(null);

  const copiar = (texto: string, key: string) => {
    navigator.clipboard.writeText(texto);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const gerar = async () => {
    if (!objetivo || !nicho || loading) return;
    setLoading(true); setResultado(null); setStream('');

    const objConfig = OBJETIVOS.find(o => o.id === objetivo);
    const tomConfig = TONS.find(t => t.id === tom);

    const prompt = `Você é especialista em copywriting para grupos VIP de WhatsApp no varejo brasileiro.

CONTEXTO:
- Nicho: ${nicho}
- Objetivo: ${objConfig?.label} — ${objConfig?.desc}
- Tom desejado: ${tomConfig?.label || 'amigável e próximo'}
${produto ? `- Produto/campanha: ${produto}` : ''}
${extras ? `- Informações extras: ${extras}` : ''}

Gere mensagens para grupo VIP de WhatsApp. Retorne APENAS JSON válido, sem markdown:

{
  "mensagens": [
    {
      "versao": "Versão 1 — <nome do ângulo usado>",
      "tom_usado": "<tom desta versão>",
      "texto": "<mensagem completa para o grupo, com emojis, quebras de linha naturais, linguagem humana e próxima>",
      "dica": "<dica de como usar esta versão>",
      "melhor_horario": "<melhor horário para enviar>"
    },
    {
      "versao": "Versão 2 — <nome do ângulo usado>",
      "tom_usado": "<tom desta versão>",
      "texto": "<mensagem completa, ângulo diferente da primeira>",
      "dica": "<dica de como usar>",
      "melhor_horario": "<melhor horário>"
    },
    {
      "versao": "Versão 3 — <nome do ângulo usado>",
      "tom_usado": "<tom desta versão>",
      "texto": "<mensagem mais curta e direta>",
      "dica": "<quando usar esta>",
      "melhor_horario": "<melhor horário>"
    }
  ],
  "dicas_gerais": ["<dica 1 de como enviar>", "<dica 2>"],
  "emojis_sugeridos": ["<emoji1>", "<emoji2>", "<emoji3>", "<emoji4>", "<emoji5>"],
  "variacao_curta": "<versão curtíssima da mensagem, máximo 2 linhas, para reenvio rápido>"
}

IMPORTANTE:
- Use linguagem natural, brasileira, como uma vendedora real falaria
- Não seja robótico nem corporativo
- Quebre linhas naturalmente como no WhatsApp
- Use emojis com moderação e estrategicamente
- Cada versão deve ter ângulo DIFERENTE
- Máximo 6-8 linhas por mensagem (versões 1 e 2)`;

    try {
      const client = new Anthropic({
        apiKey: (import.meta as any).env.VITE_ANTHROPIC_KEY,
        dangerouslyAllowBrowser: true,
      });

      let full = '';
      const stream = client.messages.stream({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [{ role: 'user', content: [{ type: 'text', text: prompt }] }],
      });

      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          full += chunk.delta.text;
          setStream(full);
        }
      }

      const clean = full.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean) as MensagemGerada;
      setResultado(parsed);
      setStream('');
      setExpanded(0);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch {
      setStream('Erro ao gerar mensagens. Verifique a chave da API.');
    }
    setLoading(false);
  };

  const limpar = () => {
    setObjetivo(''); setTom(''); setProduto(''); setExtras('');
    setResultado(null); setStream(''); setExpanded(0);
  };

  const podeGerar = objetivo && nicho && !loading;

  return (
    <div id="vip-view-root" className="animate-in fade-in duration-500 max-w-3xl mx-auto">
      <div id="vip-header" className="mb-6">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 bg-brand-purple/15 border border-brand-purple/25 rounded-xl flex items-center justify-center">
            <Crown className="w-4 h-4 text-brand-purple2" />
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white">Gerador de Mensagens VIP</h1>
        </div>
        <p className="text-sm text-gray-500 ml-10">
          Escolha o objetivo e o tom — a IA gera 3 versões prontas para disparar no grupo
        </p>
      </div>

      {!resultado && (
        <div id="vip-input-form" className="space-y-5">

          {/* Nicho */}
          <div>
            <label className="block text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-2">
              Nicho da loja <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {NICHOS.map(n => (
                <button
                  key={n}
                  id={`btn-vip-nicho-${n.replace(/\s+/g, '-').toLowerCase()}`}
                  onClick={() => setNicho(n)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                    nicho === n
                      ? 'bg-brand-purple/20 border-brand-purple/40 text-brand-purple2 font-bold'
                      : 'border-brand-light text-gray-500 hover:text-gray-300 hover:border-gray-600'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Objetivo */}
          <div>
            <label className="block text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-2">
              Objetivo da mensagem <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {OBJETIVOS.map(o => (
                <button
                  key={o.id}
                  id={`btn-objetivo-${o.id}`}
                  onClick={() => setObjetivo(o.id)}
                  className={`p-3 rounded-xl text-left transition-all border cursor-pointer ${
                    objetivo === o.id
                      ? 'bg-brand-purple/15 border-brand-purple/40'
                      : 'bg-brand-medium border-brand-light hover:border-gray-600'
                  }`}
                >
                  <p className="text-xs font-bold text-white mb-0.5">{o.label}</p>
                  <p className="text-[9px] text-gray-600 leading-snug">{o.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Tom */}
          <div>
            <label className="block text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-2">Tom da mensagem</label>
            <div className="flex flex-wrap gap-2">
              {TONS.map(t => (
                <button
                  key={t.id}
                  id={`btn-tom-${t.id}`}
                  onClick={() => setTom(t.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                    tom === t.id
                      ? 'bg-brand-purple/20 border-brand-purple/40 text-brand-purple2 font-bold'
                      : 'border-brand-light text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Produto + extras */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-1.5">
                Produto ou campanha (opcional)
              </label>
              <input
                id="input-vip-produto"
                type="text"
                value={produto}
                onChange={e => setProduto(e.target.value)}
                placeholder="ex: Coleção inverno, tênis branco, promoção fim de estoque..."
                className="w-full bg-brand-medium border border-brand-light rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-brand-purple transition-colors"
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-1.5">
                Detalhes extras (opcional)
              </label>
              <input
                id="input-vip-extras"
                type="text"
                value={extras}
                onChange={e => setExtras(e.target.value)}
                placeholder="ex: desconto de 20%, só hoje, 5 unidades..."
                className="w-full bg-brand-medium border border-brand-light rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-brand-purple transition-colors"
              />
            </div>
          </div>

          {/* Botão */}
          <button
            id="btn-gerar-vip"
            onClick={gerar}
            disabled={!podeGerar}
            className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-brand-purple text-white font-bold text-sm hover:bg-brand-purple/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading
              ? <><Loader className="w-4 h-4 animate-spin" /> Gerando mensagens...</>
              : <><Sparkles className="w-4 h-4" /> Gerar mensagens para o grupo</>
            }
          </button>

          {!objetivo && (
            <p className="text-[10px] text-gray-700 text-center">Selecione pelo menos o nicho e o objetivo para continuar</p>
          )}

          {streamText && (
            <div className="bg-brand-medium border border-brand-light rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-purple animate-pulse" />
                <p className="text-[10px] text-gray-600 uppercase tracking-widest">Gerando...</p>
              </div>
              <p className="text-xs text-gray-600 font-mono">{streamText.slice(0, 80)}...</p>
            </div>
          )}
        </div>
      )}

      {/* ── RESULTADO ── */}
      {resultado && (
        <div ref={resultRef} id="vip-resultado-container" className="space-y-4">

          {/* Header resultado */}
          <div className="bg-brand-medium border border-brand-light rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-bold text-white">
                  {resultado.mensagens.length} versões geradas
                </p>
                <p className="text-[10px] text-gray-600 mt-0.5">
                  {OBJETIVOS.find(o => o.id === objetivo)?.label} · {nicho}
                  {produto ? ` · ${produto}` : ''}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  id="btn-regerar-vip"
                  onClick={gerar}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-light border border-brand-light text-xs font-semibold text-gray-400 hover:text-white transition-all cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Regerar
                </button>
                <button
                  id="btn-nova-vip"
                  onClick={limpar}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-light border border-brand-light text-xs font-semibold text-gray-400 hover:text-white transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Nova mensagem
                </button>
              </div>
            </div>

            {/* Emojis sugeridos */}
            {resultado.emojis_sugeridos.length > 0 && (
              <div className="flex items-center gap-2">
                <p className="text-[9px] text-gray-600 uppercase tracking-widest">Emojis sugeridos:</p>
                <div className="flex gap-2">
                  {resultado.emojis_sugeridos.map((e, i) => (
                    <button
                      key={i}
                      id={`btn-emoji-copy-${i}`}
                      onClick={() => copiar(e, `emoji-${i}`)}
                      className="text-lg hover:scale-110 transition-transform cursor-pointer"
                      title="Clique para copiar"
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Versões */}
          <div className="bg-brand-medium border border-brand-light rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-brand-light">
              <p className="text-xs font-bold text-white uppercase tracking-wider">Mensagens prontas</p>
            </div>
            <div className="divide-y divide-brand-light">
              {resultado.mensagens.map((m, i) => (
                <div key={i}>
                  <button
                    id={`btn-toggle-mensagem-${i}`}
                    onClick={() => setExpanded(expanded === i ? null : i)}
                    className="w-full flex items-center gap-3 p-4 hover:bg-brand-light/20 transition-colors text-left cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-xl bg-brand-purple/15 border border-brand-purple/25 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-brand-purple2">{i+1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white">{m.versao}</p>
                      <p className="text-[10px] text-gray-600">{m.tom_usado}</p>
                    </div>
                    <span className="text-[9px] text-gray-600 shrink-0 hidden sm:block">{m.melhor_horario}</span>
                    {expanded === i ? <ChevronDown className="w-4 h-4 text-gray-600 rotate-180 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-600 shrink-0" />}
                  </button>

                  {expanded === i && (
                    <div className="px-4 pb-4 ml-10 space-y-3">
                      {/* Mensagem */}
                      <div className="bg-brand-dark rounded-2xl p-4 border border-brand-light">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center">
                              <span className="text-[9px] font-bold text-white">VIP</span>
                            </div>
                            <span className="text-[10px] text-gray-600">Grupo VIP</span>
                          </div>
                          <button
                            id={`btn-copiar-mensagem-texto-${i}`}
                            onClick={() => copiar(m.texto, `msg-${i}`)}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-light text-[10px] font-semibold text-gray-400 hover:text-white transition-all border border-brand-light cursor-pointer"
                          >
                            {copied === `msg-${i}` ? <><Check className="w-3 h-3 text-green-500" /> Copiado!</> : <><Copy className="w-3 h-3" /> Copiar mensagem</>}
                          </button>
                        </div>
                        {/* Balão estilo WhatsApp */}
                        <div className="bg-[#005C4B] rounded-2xl rounded-tl-none p-3 max-w-[90%] shadow">
                          <p className="text-sm text-white leading-relaxed whitespace-pre-line">{m.texto}</p>
                          <p className="text-[9px] text-white/40 text-right mt-1">agora ✓✓</p>
                        </div>
                      </div>

                      {/* Dica + horário */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-brand-light rounded-xl p-3">
                          <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-1">Dica de uso</p>
                          <p className="text-xs text-gray-400">{m.dica}</p>
                        </div>
                        <div className="bg-brand-light rounded-xl p-3">
                          <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-1">Melhor horário</p>
                          <p className="text-xs text-gray-400">{m.melhor_horario}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Versão curta */}
          {resultado.variacao_curta && (
            <div className="bg-brand-medium border border-brand-light rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-white">Versão ultra curta</p>
                <button
                  id="btn-copiar-ultra-curta"
                  onClick={() => copiar(resultado.variacao_curta, 'curta')}
                  className="flex items-center gap-1 text-[10px] text-gray-600 hover:text-gray-400 transition-colors cursor-pointer"
                >
                  {copied === 'curta' ? <><Check className="w-3 h-3 text-green-500" /> Copiado</> : <><Copy className="w-3 h-3" /> Copiar</>}
                </button>
              </div>
              <p className="text-sm text-gray-400 italic">"{resultado.variacao_curta}"</p>
              <p className="text-[9px] text-gray-700 mt-1.5">Para reenvio rápido ou quando quiser ser mais direto</p>
            </div>
          )}

          {/* Dicas gerais */}
          {resultado.dicas_gerais.length > 0 && (
            <div className="bg-brand-purple/8 border border-brand-purple/20 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-brand-purple2" />
                <p className="text-xs font-bold text-brand-purple2">Dicas de envio</p>
              </div>
              <div className="space-y-1.5">
                {resultado.dicas_gerais.map((d, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-brand-purple2 mt-1.5 shrink-0" />
                    <p className="text-xs text-gray-400">{d}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            id="btn-nova-vip-fim"
            onClick={limpar}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-brand-medium border border-brand-light text-sm font-semibold text-gray-400 hover:text-white hover:border-gray-600 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" /> Gerar outra mensagem
          </button>
        </div>
      )}
    </div>
  );
}
