import React, { useState, useRef, useCallback } from 'react';
import {
  MessageSquare, Sparkles, Loader, RotateCcw,
  Star, AlertTriangle, CheckCircle, ArrowRight,
  ChevronDown, ChevronUp, Copy, Check,
  Image as ImageIcon, X, Upload, FileText,
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

// ─── Critérios de análise ────────────────────────────────────────────────────
const CRITERIOS = [
  'Tempo e agilidade de resposta',
  'Investigação de necessidade',
  'Uso do nome do cliente',
  'Apresentação do produto',
  'Quebra de objeção',
  'Tentativa de fechamento',
  'Follow-up e continuidade',
  'Energia e personalização',
  'Condução para a venda',
  'Geração de urgência',
];

// ─── Tipos ───────────────────────────────────────────────────────────────────
interface Feedback {
  nota: number;
  resumo: string;
  pontos_positivos: string[];
  pontos_melhoria: { erro: string; como_deveria: string; exemplo: string }[];
  criterios: { nome: string; nota: number; comentario: string }[];
  veredicto: string;
}

interface ImagemPreview {
  file: File;
  url: string;
  base64: string;
  mediaType: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const notaCor = (n: number) =>
  n >= 8 ? '#22c55e' : n >= 6 ? '#f59e0b' : '#ef4444';

const notaLabel = (n: number) =>
  n >= 8 ? 'Bom atendimento' : n >= 6 ? 'Precisa melhorar' : 'Atendimento fraco';

function NotaBadge({ nota }: { nota: number }) {
  const cor = notaCor(nota);
  return (
    <div id="nota-badge-container" className="flex flex-col items-center justify-center w-20 h-20 rounded-2xl border-2"
      style={{ borderColor: cor, background: `${cor}15` }}>
      <span className="text-3xl font-black" style={{ color: cor }}>{nota}</span>
      <span id="nota-badge-denominator" className="text-[9px] font-bold uppercase tracking-wider" style={{ color: cor }}>/ 10</span>
    </div>
  );
}

function StarRow({ nota }: { nota: number }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className="w-3 h-3"
          fill={i <= Math.round(nota / 2) ? notaCor(nota) : 'transparent'}
          stroke={notaCor(nota)}
        />
      ))}
    </div>
  );
}

// ─── Converter File para base64 ───────────────────────────────────────────────
const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

// ─── Componente principal ─────────────────────────────────────────────────────
export function AtendimentoView() {
  const [modo, setModo]           = useState<'texto' | 'imagem'>('texto');
  const [conversa, setConversa]   = useState('');
  const [imagens, setImagens]     = useState<ImagemPreview[]>([]);
  const [dragging, setDragging]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [feedback, setFeedback]   = useState<Feedback | null>(null);
  const [streamText, setStream]   = useState('');
  const [copied, setCopied]       = useState(false);
  const [expanded, setExpanded]   = useState<number | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const EXEMPLOS = [
    `Cliente: Oi, vi o sapato no stories
Vendedora: Oi! Qual modelo?
Cliente: O branco
Vendedora: R$ 289
Cliente: Tá caro
Vendedora: Temos parcelado
Cliente: Ok obrigada
Vendedora: De nada`,

    `Cliente: Bom dia! Vi o tênis no Instagram, ainda tem?
Vendedora: Bom dia Ana! Que bom que gostou 😊 Tem sim! Qual número você usa?
Cliente: 36
Vendedora: Perfeito! Temos no 36 sim. Você vai usar mais no dia a dia ou para trabalhar?
Cliente: Dia a dia mesmo, vou muito a pé
Vendedora: Então esse é ideal pra você! A sola é bem confortável, várias clientes que usam muito me falam que é o mais confortável que já tiveram. Posso separar um pra você ver pessoalmente?
Cliente: Quanto é?
Vendedora: R$320, mas parcelamos em até 4x sem juros. Posso reservar pro seu nome?
Cliente: Vou pensar
Vendedora: Claro! Só te aviso que temos 2 pares no 36 — posso deixar reservado por hoje até às 18h pro caso de você decidir. Quer que os mande foto com mais detalhes?`,
  ];

  // ─── Adicionar imagens ───────────────────────────────────────────────────
  const adicionarImagens = useCallback(async (files: FileList | File[]) => {
    const arr = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (!arr.length) return;
    const novas: ImagemPreview[] = await Promise.all(arr.map(async f => ({
      file: f,
      url: URL.createObjectURL(f),
      base64: await fileToBase64(f),
      mediaType: f.type,
    })));
    setImagens(prev => [...prev, ...novas].slice(0, 10)); // max 10 prints
  }, []);

  const removerImagem = (i: number) =>
    setImagens(prev => prev.filter((_, idx) => idx !== i));

  // ─── Drag & drop ────────────────────────────────────────────────────────
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files) {
      adicionarImagens(e.dataTransfer.files);
    }
  }, [adicionarImagens]);

  // ─── Montar prompt ───────────────────────────────────────────────────────
  const promptBase = `Você é um especialista em vendas consultivas e atendimento ao cliente no varejo de moda/calçados via WhatsApp.

Analise o atendimento ${modo === 'imagem' ? 'nas imagens' : 'abaixo'} com olhar crítico e construtivo.
${modo === 'imagem' ? 'As imagens são prints de conversa do WhatsApp. Leia todas as mensagens visíveis na ordem enviada.' : `CONVERSA:\n${conversa}`}

CRITÉRIOS DE ANÁLISE:
${CRITERIOS.map((c, i) => `${i+1}. ${c}`).join('\n')}

RETORNE EXATAMENTE NESTE FORMATO JSON:
{
  "nota": <número de 0 a 10>,
  "resumo": "<resumo em 1-2 frases do atendimento>",
  "pontos_positivos": ["<ponto positivo 1>", "<ponto positivo 2>"],
  "pontos_melhoria": [
    {
      "erro": "<o que foi feito de errado, específico>",
      "como_deveria": "<como deveria ter sido feito>",
      "exemplo": "<exemplo concreto de como responder melhor>"
    }
  ],
  "criterios": [
    { "nome": "<nome do critério>", "nota": <0-10>, "comentario": "<comentário breve>" }
  ],
  "veredicto": "<frase final motivacional e direta, máximo 2 linhas>"
}

Seja específico, direto e use linguagem simples. Foque no que realmente impacta a conversão.`;

  const analisar = async () => {
    const temTexto  = conversa.trim().length > 0;
    const temImagem = imagens.length > 0;
    if ((modo === 'texto' && !temTexto) || (modo === 'imagem' && !temImagem) || loading) return;

    setLoading(true);
    setFeedback(null);
    setStream('');

    try {
      const client = new Anthropic({
        apiKey: (import.meta as any).env.VITE_ANTHROPIC_KEY,
        dangerouslyAllowBrowser: true,
      });

      // Montar conteúdo da mensagem para a API do Anthropic
      const content: any[] = [];

      // Imagens primeiro se houver
      if (modo === 'imagem') {
        for (const img of imagens) {
          content.push({
            type: 'image',
            source: {
              type: 'base64',
              media_type: img.mediaType as any,
              data: img.base64,
            },
          });
        }
      }

      // Prompt de texto
      content.push({
        type: 'text',
        text: promptBase,
      });

      let full = '';
      const stream = client.messages.stream({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1500,
        messages: [{ role: 'user', content }],
      });

      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          full += chunk.delta.text;
          setStream(full);
        }
      }

      // Parse JSON
      const clean = full.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean) as Feedback;
      setFeedback(parsed);
      setStream('');
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err) {
      setStream('Erro ao analisar. Verifique a chave da API e tente novamente.');
    }

    setLoading(false);
  };

  const copiarFeedback = () => {
    if (!feedback) return;
    const texto = [
      `ANÁLISE DE ATENDIMENTO — Nota: ${feedback.nota}/10`,
      '',
      feedback.resumo,
      '',
      '✅ PONTOS POSITIVOS',
      ...feedback.pontos_positivos.map(p => `• ${p}`),
      '',
      '❌ PONTOS DE MELHORIA',
      ...feedback.pontos_melhoria.map(p => `• ${p.erro}\n  → Como deveria: ${p.como_deveria}\n  → Exemplo: ${p.exemplo}`),
      '',
      `💬 ${feedback.veredicto}`,
    ].join('\n');
    navigator.clipboard.writeText(texto);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const limpar = () => {
    setConversa('');
    setImagens([]);
    setFeedback(null);
    setStream('');
    setExpanded(null);
  };

  const podeAnalisar = (modo === 'texto' ? conversa.trim().length > 0 : imagens.length > 0) && !loading;

  return (
    <div id="atendimento-view-root" className="animate-in fade-in duration-500 max-w-3xl mx-auto">

      {/* Header */}
      <div id="atendimento-header" className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-extrabold text-white mb-1">
          Treinador de Atendimento
        </h1>
        <p className="text-sm text-gray-400">
          Cole o texto ou envie prints da conversa — a IA analisa e devolve feedback detalhado
        </p>
      </div>

      {/* Input Form Box */}
      {!feedback && (
        <div id="atendimento-input-form" className="space-y-4">

          {/* Toggle Modo */}
          <div className="flex gap-1 bg-brand-medium border border-brand-light rounded-xl p-1">
            <button
              id="btn-tab-texto"
              onClick={() => setModo('texto')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                modo === 'texto' ? 'bg-brand-light text-white font-bold' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Colar texto
            </button>
            <button
              id="btn-tab-imagem"
              onClick={() => setModo('imagem')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                modo === 'imagem' ? 'bg-brand-light text-white font-bold' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" /> Enviar prints
              <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-brand-purple/20 text-brand-purple2 border border-brand-purple/25">novo</span>
            </button>
          </div>

          {/* ── MODO TEXTO ── */}
          {modo === 'texto' && (
            <>
              {/* Exemplos rápidos */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] text-gray-600 uppercase tracking-widest">Testar com exemplo:</span>
                <button
                  id="btn-exemplo-fraco"
                  onClick={() => setConversa(EXEMPLOS[0])}
                  className="text-[10px] px-2.5 py-1 rounded-lg bg-brand-light border border-brand-light text-gray-400 hover:text-white hover:border-gray-600 transition-all cursor-pointer"
                >
                  Atendimento fraco
                </button>
                <button
                  id="btn-exemplo-bom"
                  onClick={() => setConversa(EXEMPLOS[1])}
                  className="text-[10px] px-2.5 py-1 rounded-lg bg-brand-light border border-brand-light text-gray-400 hover:text-white hover:border-gray-600 transition-all cursor-pointer"
                >
                  Bom atendimento
                </button>
              </div>

              {/* Textarea */}
              <div className="relative">
                <textarea
                  id="atendimento-chat-textarea"
                  value={conversa}
                  onChange={e => setConversa(e.target.value)}
                  placeholder={`Cole aqui a conversa do WhatsApp. Exemplo:\n\nCliente: Oi, vi o tênis no stories\nVendedora: Oi! Qual modelo?\nCliente: O branco\n...`}
                  rows={14}
                  className="w-full bg-brand-medium border border-brand-light rounded-2xl px-5 py-4 text-sm text-gray-200 placeholder-gray-700 focus:outline-none focus:border-brand-purple transition-colors resize-none font-mono leading-relaxed"
                />
                {conversa && (
                  <div className="absolute bottom-3 right-3 text-[9px] text-gray-700">
                    {conversa.split('\n').filter(l => l.trim()).length} linhas
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── MODO IMAGEM ── */}
          {modo === 'imagem' && (
            <>
              {/* Drop Zone */}
              <div
                id="dropzone-atendimento"
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => fileInput.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  dragging
                    ? 'border-brand-purple bg-brand-purple/10 shadow-lg'
                    : 'border-brand-light hover:border-gray-600 hover:bg-brand-medium/60'
                }`}
              >
                <input
                  ref={fileInput}
                  id="file-input-atendimento"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={e => e.target.files && adicionarImagens(e.target.files)}
                />
                <Upload className={`w-8 h-8 mx-auto mb-3 transition-colors ${dragging ? 'text-brand-purple' : 'text-gray-600'}`} />
                <p className="text-sm font-semibold text-gray-300 mb-1">
                  {dragging ? 'Solte os prints aqui' : 'Arraste prints ou clique para selecionar'}
                </p>
                <p className="text-[10px] text-gray-600">
                  PNG, JPG · Até 10 prints · Envie na ordem cronológica se puder
                </p>
              </div>

              {/* Imagens previews */}
              {imagens.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      {imagens.length} print{imagens.length > 1 ? 's' : ''} carregado{imagens.length > 1 ? 's' : ''}
                    </p>
                    <button
                      onClick={() => setImagens([])}
                      className="text-[10px] text-red-400 hover:text-red-300 cursor-pointer"
                    >
                      Remover todos
                    </button>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {imagens.map((img, i) => (
                      <div key={i} className="relative group aspect-[9/16] rounded-xl overflow-hidden bg-brand-light border border-brand-light shadow">
                        <img src={img.url} alt={`Print ${i+1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        {/* Indicador de ordem */}
                        <div className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-brand-dark/80 flex items-center justify-center border border-brand-light select-none">
                          <span className="text-[9px] font-bold text-white">{i+1}</span>
                        </div>
                        {/* Remover */}
                        <button
                          onClick={(e) => { e.stopPropagation(); removerImagem(i); }}
                          className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-red-900/80 hover:bg-red-800 flex items-center justify-center opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow"
                        >
                          <X className="w-2.5 h-2.5 text-white" />
                        </button>
                      </div>
                    ))}
                    {/* Botão adicionar mais */}
                    {imagens.length < 10 && (
                      <button
                        id="btn-upload-atendimento"
                        onClick={() => fileInput.current?.click()}
                        className="aspect-[9/16] rounded-xl border-2 border-dashed border-brand-light flex flex-col items-center justify-center gap-1.5 text-gray-600 hover:text-gray-400 hover:border-gray-600 transition-all cursor-pointer bg-brand-medium/20"
                      >
                        <Upload className="w-4 h-4" />
                        <span className="text-[9px] font-bold">Adicionar</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Dicas de formato (Modo texto) */}
          {modo === 'texto' && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-brand-medium border border-brand-light">
              <MessageSquare className="w-4 h-4 text-brand-purple2 shrink-0 mt-0.5" />
              <div className="text-[10px] text-gray-500 leading-relaxed">
                <strong className="text-gray-400">Formato recomendado:</strong> Cole como aparece no WhatsApp, com o nome antes de cada mensagem.
                Funciona com exportação direta do app (Configurações → Exportar conversa) ou digitando manualmente.
              </div>
            </div>
          )}

          {/* Botão Analisar */}
          <button
            id="btn-analisar-atendimento"
            onClick={analisar}
            disabled={!podeAnalisar}
            className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-brand-purple text-white font-bold text-sm hover:bg-brand-purple/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading
              ? <><Loader className="w-4 h-4 animate-spin" /> Analisando {modo === 'imagem' ? 'prints' : 'conversa'}...</>
              : <><Sparkles className="w-4 h-4" /> Analisar atendimento {imagens.length > 0 ? `(${imagens.length} print${imagens.length > 1 ? 's' : ''})` : ''}</>
            }
          </button>

          {/* Stream enquanto carrega */}
          {streamText && (
            <div className="bg-brand-medium border border-brand-light rounded-xl p-4">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-purple animate-ping" />
                Processando análise...
              </p>
              <p className="text-xs text-gray-400 font-mono leading-relaxed">{streamText.slice(0, 200)}...</p>
            </div>
          )}
        </div>
      )}

      {/* Resultado */}
      {feedback && (
        <div ref={resultRef} id="atendimento-resultado-container" className="space-y-4">

          {/* Topo — nota + resumo + ações */}
          <div className="bg-brand-medium border border-brand-light rounded-2xl p-5">
            <div className="flex items-start gap-4">
              <NotaBadge nota={feedback.nota} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold" style={{ color: notaCor(feedback.nota) }}>
                    {notaLabel(feedback.nota)}
                  </span>
                  <StarRow nota={feedback.nota} />
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">{feedback.resumo}</p>
              </div>
            </div>

            {/* Ações */}
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-brand-light">
              <button
                id="btn-copiar-feedback"
                onClick={copiarFeedback}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-light border border-brand-light text-xs font-semibold text-gray-400 hover:text-white transition-all cursor-pointer"
              >
                {copied ? <><Check className="w-3.5 h-3.5 text-green-500" /> Copiado!</> : <><Copy className="w-3.5 h-3.5" /> Copiar feedback</>}
              </button>
              <button
                id="btn-nova-analise"
                onClick={limpar}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-light border border-brand-light text-xs font-semibold text-gray-400 hover:text-white transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Nova análise
              </button>
            </div>
          </div>

          {/* Pontos positivos */}
          {feedback.pontos_positivos.length > 0 && (
            <div className="bg-green-950/20 border border-green-900/30 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <p className="text-xs font-bold text-green-500 uppercase tracking-wider">O que foi bem</p>
              </div>
              <div className="space-y-2">
                {feedback.pontos_positivos.map((p, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0 mt-1.5" />
                    <p className="text-sm text-gray-300 leading-relaxed">{p}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pontos de melhoria */}
          {feedback.pontos_melhoria.length > 0 && (
            <div className="bg-brand-medium border border-brand-light rounded-2xl overflow-hidden">
              <div className="flex items-center gap-2 p-5 border-b border-brand-light">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <p className="text-xs font-bold text-amber-500 uppercase tracking-wider">
                  O que precisa melhorar
                </p>
                <span className="text-[10px] text-gray-600 ml-auto">
                  {feedback.pontos_melhoria.length} ponto{feedback.pontos_melhoria.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="divide-y divide-brand-light">
                {feedback.pontos_melhoria.map((p, i) => (
                  <div key={i}>
                    <button
                      id={`btn-toggle-melhoria-${i}`}
                      onClick={() => setExpanded(expanded === i ? null : i)}
                      className="w-full flex items-start gap-3 p-4 hover:bg-brand-light/20 transition-colors text-left cursor-pointer"
                    >
                      <div className="w-5 h-5 rounded-full bg-red-900/30 border border-red-800/40 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[9px] font-bold text-red-400">{i+1}</span>
                      </div>
                      <p className="flex-1 text-sm font-semibold text-gray-200">{p.erro}</p>
                      {expanded === i
                        ? <ChevronUp className="w-4 h-4 text-gray-600 shrink-0 mt-0.5" />
                        : <ChevronDown className="w-4 h-4 text-gray-600 shrink-0 mt-0.5" />
                      }
                    </button>

                    {expanded === i && (
                      <div className="px-4 pb-4 space-y-3 ml-8">
                        {/* Como deveria */}
                        <div className="flex items-start gap-2">
                          <ArrowRight className="w-3.5 h-3.5 text-brand-purple2 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[10px] font-bold text-brand-purple2 uppercase tracking-wider mb-1">Como deveria ser</p>
                            <p className="text-sm text-gray-400 leading-relaxed">{p.como_deveria}</p>
                          </div>
                        </div>
                        {/* Exemplo */}
                        <div className="bg-brand-dark rounded-xl p-3 border border-brand-light">
                          <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-2">Exemplo de resposta</p>
                          <p className="text-sm text-gray-300 leading-relaxed italic">"{p.exemplo}"</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Critérios detalhados */}
          {feedback.criterios.length > 0 && (
            <div className="bg-brand-medium border border-brand-light rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-brand-light">
                <p className="text-xs font-bold text-white uppercase tracking-wider">Análise por critério</p>
              </div>
              <div className="divide-y divide-brand-light">
                {feedback.criterios.map((c, i) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-300 mb-0.5">{c.nome}</p>
                      <p className="text-[10px] text-gray-600 leading-snug">{c.comentario}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="text-sm font-bold" style={{ color: notaCor(c.nota) }}>{c.nota}</span>
                      <span className="text-[9px] text-gray-700">/10</span>
                      <div className="w-16 h-1 bg-brand-light rounded-full mt-1 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${c.nota * 10}%`, background: notaCor(c.nota) }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Veredicto final */}
          <div className="bg-brand-purple/10 border border-brand-purple/25 rounded-2xl p-5 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-brand-purple2 shrink-0 mt-0.5" />
            <p className="text-sm text-gray-300 leading-relaxed">{feedback.veredicto}</p>
          </div>

          {/* Botão nova análise */}
          <button
            id="btn-limpar-atendimento"
            onClick={limpar}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-brand-medium border border-brand-light text-sm font-semibold text-gray-400 hover:text-white hover:border-gray-600 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" /> Analisar outra conversa
          </button>
        </div>
      )}
    </div>
  );
}
