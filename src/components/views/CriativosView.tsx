import React, { useState, useRef, useCallback } from 'react';
import {
  Zap, Sparkles, Loader, RotateCcw, Upload, X,
  Copy, Check, ChevronDown, ChevronUp, Image as ImageIcon,
  FileText, TrendingUp, Eye, Target, Volume2,
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

// ─── Tipos ───────────────────────────────────────────────────────────────────
interface AnaliseCreativo {
  resumo: string;
  por_que_funcionou: string[];
  gancho: { tipo: string; descricao: string; nota: number };
  emocao_dominante: string;
  estrutura: string[];
  tipo_cta: string;
  estilo_copy: string;
  nivel_autoridade: string;
  padrao_visual: string;
  pontos_fracos: string[];
  variacoes: {
    titulo: string;
    descricao: string;
    gancho_sugerido: string;
    copy_abertura: string;
    cta: string;
    angulo: string;
  }[];
  score_potencial: number;
}

interface ImagemPreview {
  file: File;
  url: string;
  base64: string;
  mediaType: string;
}

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res((r.result as string).split(',')[1]);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

const scoreCor = (n: number) =>
  n >= 8 ? '#22c55e' : n >= 6 ? '#f59e0b' : '#ef4444';

// ─── Componente ──────────────────────────────────────────────────────────────
export function CriativosView() {
  const [modo, setModo]         = useState<'imagem' | 'texto'>('imagem');
  const [descricao, setDesc]    = useState('');
  const [imagens, setImagens]   = useState<ImagemPreview[]>([]);
  const [contexto, setContexto] = useState('');
  const [nicho, setNicho]       = useState('');
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [analise, setAnalise]   = useState<AnaliseCreativo | null>(null);
  const [streamText, setStream] = useState('');
  const [copied, setCopied]     = useState<string | null>(null);
  const [expandVar, setExpandVar] = useState<number | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const adicionarImagens = useCallback(async (files: FileList | File[]) => {
    const arr = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (!arr.length) return;
    const novas: ImagemPreview[] = await Promise.all(arr.map(async f => ({
      file: f,
      url: URL.createObjectURL(f),
      base64: await fileToBase64(f),
      mediaType: f.type,
    })));
    setImagens(prev => [...prev, ...novas].slice(0, 5));
  }, []);

  const copiar = (texto: string, key: string) => {
    navigator.clipboard.writeText(texto);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const analisar = async () => {
    const temConteudo = modo === 'imagem' ? imagens.length > 0 : descricao.trim().length > 0;
    if (!temConteudo || loading) return;
    setLoading(true); setAnalise(null); setStream('');

    const prompt = `Você é um especialista em marketing digital, copywriting e psicologia do consumidor com profundo conhecimento em criativos para tráfego pago no varejo.

${nicho ? `NICHO/CONTEXTO: ${nicho}` : ''}
${contexto ? `INFORMAÇÕES ADICIONAIS: ${contexto}` : ''}
${modo === 'texto' ? `DESCRIÇÃO DO CRIATIVO:\n${descricao}` : 'Analise o(s) criativo(s) nas imagens acima.'}

Analise este criativo com profundidade. Retorne APENAS JSON válido, sem markdown:

{
  "resumo": "<resumo do criativo em 1-2 frases>",
  "por_que_funcionou": ["<razão 1>", "<razão 2>", "<razão 3>"],
  "gancho": {
    "tipo": "<tipo: dor/curiosidade/urgência/prova social/autoridade/identificação/surpresa>",
    "descricao": "<como o gancho foi executado>",
    "nota": <0-10>
  },
  "emocao_dominante": "<emoção principal ativada: medo/desejo/raiva/esperança/inveja/orgulho/curiosidade>",
  "estrutura": ["<passo 1 da estrutura>", "<passo 2>", "<passo 3>"],
  "tipo_cta": "<tipo de CTA e como foi usado>",
  "estilo_copy": "<descrição do estilo: conversacional/autoritativo/empático/urgência/storytelling>",
  "nivel_autoridade": "<como a autoridade foi estabelecida ou não>",
  "padrao_visual": "<padrão visual, cores, composição, ritmo>",
  "pontos_fracos": ["<o que poderia melhorar>"],
  "variacoes": [
    {
      "titulo": "<nome da variação>",
      "descricao": "<por que testar essa variação>",
      "gancho_sugerido": "<novo gancho para testar>",
      "copy_abertura": "<primeiras 2-3 linhas do copy>",
      "cta": "<call to action sugerido>",
      "angulo": "<ângulo diferente: dor/solução/prova/curiosidade/urgência>"
    }
  ],
  "score_potencial": <0-10 — potencial de performance estimado>
}

Gere 3 variações distintas com ângulos diferentes. Seja específico e acionável.`;

    try {
      const client = new Anthropic({
        apiKey: (import.meta as any).env.VITE_ANTHROPIC_KEY,
        dangerouslyAllowBrowser: true,
      });

      type Block =
        | { type: 'text'; text: string }
        | { type: 'image'; source: { type: 'base64'; media_type: string; data: string } };

      const content: Block[] = [];
      for (const img of imagens) {
        content.push({ type: 'image', source: { type: 'base64', media_type: img.mediaType, data: img.base64 } });
      }
      content.push({ type: 'text', text: prompt });

      let full = '';
      const stream = client.messages.stream({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [{ role: 'user', content }],
      });

      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          full += chunk.delta.text;
          setStream(full);
        }
      }

      const clean = full.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean) as AnaliseCreativo;
      setAnalise(parsed);
      setStream('');
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch {
      setStream('Erro ao analisar. Verifique a chave da API e tente novamente.');
    }
    setLoading(false);
  };

  const limpar = () => {
    setDesc(''); setImagens([]); setContexto(''); setNicho('');
    setAnalise(null); setStream(''); setExpandVar(null);
  };

  const NICHOS = ['Moda feminina', 'Calçados', 'Cosméticos', 'Fitness', 'Alimentação', 'Outro'];

  return (
    <div id="criativos-view-root" className="animate-in fade-in duration-500 max-w-3xl mx-auto">
      <div id="criativos-header" className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-extrabold text-white mb-1">Inteligência de Criativos</h1>
        <p className="text-sm text-gray-500">Envie um anúncio e descubra por que funcionou — com variações prontas para testar</p>
      </div>

      {!analise && (
        <div id="criativos-input-form" className="space-y-4">
          {/* Toggle */}
          <div className="flex gap-1 bg-brand-medium border border-brand-light rounded-xl p-1">
            <button
              id="btn-criativo-tab-imagem"
              onClick={() => setModo('imagem')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${modo === 'imagem' ? 'bg-brand-light text-white font-bold' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <ImageIcon className="w-3.5 h-3.5" /> Imagem do anúncio
            </button>
            <button
              id="btn-criativo-tab-texto"
              onClick={() => setModo('texto')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${modo === 'texto' ? 'bg-brand-light text-white font-bold' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <FileText className="w-3.5 h-3.5" /> Descrever o anúncio
            </button>
          </div>

          {/* Contexto */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-1.5">Nicho</label>
              <div className="flex flex-wrap gap-1.5">
                {NICHOS.map(n => (
                  <button
                    key={n}
                    id={`btn-nicho-${n.replace(/\s+/g, '-').toLowerCase()}`}
                    onClick={() => setNicho(n)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all border cursor-pointer ${
                      nicho === n ? 'bg-brand-purple/20 border-brand-purple/40 text-brand-purple2 font-bold' : 'border-brand-light text-gray-600 hover:text-gray-400'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-1.5">Contexto adicional (opcional)</label>
              <input
                id="input-criativo-contexto"
                type="text"
                value={contexto}
                onChange={e => setContexto(e.target.value)}
                placeholder="ex: anúncio para público feminino 25-40, produto premium..."
                className="w-full bg-brand-medium border border-brand-light rounded-xl px-3 py-2 text-xs text-white placeholder-gray-700 focus:outline-none focus:border-brand-purple transition-colors"
              />
            </div>
          </div>

          {/* Input imagem */}
          {modo === 'imagem' && (
            <>
              <div
                id="dropzone-criativo"
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files) adicionarImagens(e.dataTransfer.files); }}
                onClick={() => fileInput.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  dragging ? 'border-brand-purple bg-brand-purple/10' : 'border-brand-light hover:border-gray-600 hover:bg-brand-medium/60'
                }`}
              >
                <input ref={fileInput} id="file-input-criativo" type="file" accept="image/*" multiple className="hidden"
                  onChange={e => e.target.files && adicionarImagens(e.target.files)} />
                <Upload className={`w-7 h-7 mx-auto mb-2 ${dragging ? 'text-brand-purple' : 'text-gray-600'}`} />
                <p className="text-sm font-semibold text-gray-400 mb-1">Arraste o criativo ou clique para selecionar</p>
                <p className="text-[10px] text-gray-700">PNG, JPG · Até 5 imagens · Print de post, story ou anúncio</p>
              </div>
              {imagens.length > 0 && (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {imagens.map((img, i) => (
                    <div key={i} className="relative group aspect-square rounded-xl overflow-hidden bg-brand-light border border-brand-light shadow">
                      <img src={img.url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      <button
                        onClick={(e) => { e.stopPropagation(); setImagens(p => p.filter((_, idx) => idx !== i)); }}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-900/80 flex items-center justify-center opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <X className="w-2.5 h-2.5 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Input texto */}
          {modo === 'texto' && (
            <textarea
              id="textarea-criativo-desc"
              value={descricao}
              onChange={e => setDesc(e.target.value)}
              placeholder="Descreva o criativo detalhadamente: o que aparece, o texto usado, o gancho, o CTA, as cores, o público percebido..."
              rows={8}
              className="w-full bg-brand-medium border border-brand-light rounded-2xl px-5 py-4 text-sm text-gray-200 placeholder-gray-700 focus:outline-none focus:border-brand-purple transition-colors resize-none leading-relaxed"
            />
          )}

          {/* Botão */}
          <button
            id="btn-analisar-criativo"
            onClick={analisar}
            disabled={loading || (modo === 'imagem' ? imagens.length === 0 : !descricao.trim())}
            className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-brand-purple text-white font-bold text-sm hover:bg-brand-purple/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? <><Loader className="w-4 h-4 animate-spin" /> Analisando criativo...</> : <><Zap className="w-4 h-4" /> Analisar criativo</>}
          </button>

          {streamText && (
            <div className="bg-brand-medium border border-brand-light rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-purple animate-pulse" />
                <p className="text-[10px] text-gray-600 uppercase tracking-widest">Processando...</p>
              </div>
              <p className="text-xs text-gray-400 font-mono">{streamText.slice(0, 80)}...</p>
            </div>
          )}
        </div>
      )}

      {/* ── RESULTADO ── */}
      {analise && (
        <div ref={resultRef} id="criativo-resultado-container" className="space-y-4">

          {/* Score + resumo */}
          <div className="bg-brand-medium border border-brand-light rounded-2xl p-5">
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center justify-center w-20 h-20 rounded-2xl border-2 shrink-0"
                style={{ borderColor: scoreCor(analise.score_potencial), background: `${scoreCor(analise.score_potencial)}15` }}>
                <span className="text-3xl font-black" style={{ color: scoreCor(analise.score_potencial) }}>{analise.score_potencial}</span>
                <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: scoreCor(analise.score_potencial) }}>potencial</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white mb-1.5">Resumo do criativo</p>
                <p className="text-sm text-gray-300 leading-relaxed">{analise.resumo}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-4 pt-4 border-t border-brand-light">
              <button
                id="btn-novo-criativo"
                onClick={limpar}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-light border border-brand-light text-xs font-semibold text-gray-400 hover:text-white transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Novo criativo
              </button>
            </div>
          </div>

          {/* Por que funcionou */}
          <div className="bg-green-950/20 border border-green-900/30 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <p className="text-xs font-bold text-green-500 uppercase tracking-wider">Por que funcionou</p>
            </div>
            <div className="space-y-2">
              {analise.por_que_funcionou.map((r, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                  <p className="text-sm text-gray-300 leading-relaxed">{r}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Diagnóstico */}
          <div className="bg-brand-medium border border-brand-light rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-brand-light">
              <p className="text-xs font-bold text-white uppercase tracking-wider">Diagnóstico do criativo</p>
            </div>
            <div className="divide-y divide-brand-light">
              {[
                { icon: Zap,     label: 'Gancho',           val: `${analise.gancho.tipo} — ${analise.gancho.descricao}`, sub: `Nota: ${analise.gancho.nota}/10` },
                { icon: Eye,     label: 'Emoção dominante', val: analise.emocao_dominante },
                { icon: Target,  label: 'Tipo de CTA',      val: analise.tipo_cta },
                { icon: FileText,label: 'Estilo de copy',   val: analise.estilo_copy },
                { icon: Volume2, label: 'Nível de autoridade', val: analise.nivel_autoridade },
                { icon: ImageIcon,label: 'Padrão visual',    val: analise.padrao_visual },
              ].map(({ icon: Icon, label, val, sub }, i) => (
                <div key={i} className="flex items-start gap-3 px-5 py-3.5">
                  <div className="w-7 h-7 rounded-lg bg-brand-light flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-3.5 h-3.5 text-brand-purple2" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-0.5">{label}</p>
                    <p className="text-sm text-gray-300">{val}</p>
                    {sub && <p className="text-[10px] text-gray-600 mt-0.5">{sub}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Estrutura */}
          <div className="bg-brand-medium border border-brand-light rounded-2xl p-5">
            <p className="text-xs font-bold text-white uppercase tracking-wider mb-3">Estrutura do criativo</p>
            <div className="flex flex-col gap-2">
              {analise.estrutura.map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-brand-purple/20 border border-brand-purple/30 flex items-center justify-center shrink-0">
                    <span className="text-[9px] font-bold text-brand-purple2">{i+1}</span>
                  </div>
                  <div className="flex-1 h-px bg-brand-light" />
                  <p className="text-xs text-gray-400 max-w-[75%] text-right">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Pontos fracos */}
          {analise.pontos_fracos.length > 0 && (
            <div className="bg-amber-950/20 border border-amber-900/30 rounded-2xl p-5">
              <p className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-3">O que poderia melhorar</p>
              <div className="space-y-1.5">
                {analise.pontos_fracos.map((p, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <p className="text-sm text-gray-400">{p}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Variações */}
          <div className="bg-brand-medium border border-brand-light rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-brand-light">
              <p className="text-xs font-bold text-white uppercase tracking-wider">3 variações para testar</p>
              <p className="text-[10px] text-gray-600 mt-0.5">Ângulos diferentes baseados na análise do criativo original</p>
            </div>
            <div className="divide-y divide-brand-light">
              {analise.variacoes.map((v, i) => (
                <div key={i}>
                  <button
                    id={`btn-toggle-variacao-${i}`}
                    onClick={() => setExpandVar(expandVar === i ? null : i)}
                    className="w-full flex items-center gap-3 p-4 hover:bg-brand-light/20 transition-colors text-left cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-xl bg-brand-purple/15 border border-brand-purple/25 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-brand-purple2">{i+1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white">{v.titulo}</p>
                      <p className="text-[10px] text-gray-600 truncate">{v.descricao}</p>
                    </div>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-brand-light text-gray-500 shrink-0">{v.angulo}</span>
                    {expandVar === i ? <ChevronUp className="w-4 h-4 text-gray-600 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-600 shrink-0" />}
                  </button>
                  {expandVar === i && (
                    <div className="px-4 pb-4 ml-10 space-y-3">
                      <div>
                        <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-1">Gancho sugerido</p>
                        <p className="text-sm text-gray-300">{v.gancho_sugerido}</p>
                      </div>
                      <div className="bg-brand-dark rounded-xl p-3 border border-brand-light">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Copy de abertura</p>
                          <button
                            id={`btn-copiar-variacao-${i}`}
                            onClick={() => copiar(`${v.gancho_sugerido}\n\n${v.copy_abertura}\n\n${v.cta}`, `var-${i}`)}
                            className="flex items-center gap-1 text-[9px] text-gray-600 hover:text-gray-400 transition-colors cursor-pointer"
                          >
                            {copied === `var-${i}` ? <><Check className="w-3 h-3 text-green-500" /> Copiado</> : <><Copy className="w-3 h-3" /> Copiar</>}
                          </button>
                        </div>
                        <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-line">{v.copy_abertura}</p>
                        <div className="mt-3 pt-3 border-t border-brand-light">
                          <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-1">CTA</p>
                          <p className="text-sm text-brand-purple2 font-semibold">{v.cta}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            id="btn-novo-criativo-limpar"
            onClick={limpar}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-brand-medium border border-brand-light text-sm font-semibold text-gray-400 hover:text-white hover:border-gray-600 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" /> Analisar outro criativo
          </button>
        </div>
      )}
    </div>
  );
}
