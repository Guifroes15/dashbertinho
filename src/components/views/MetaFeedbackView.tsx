import React, { useState, useCallback } from 'react';
import { Copy, Check, RefreshCw, MessageSquare } from 'lucide-react';
import { META_ACCOUNTS } from '../../config/metaAccounts';
import { getAccountFeedbackData, FeedbackData } from '../../services/metaService';

// Nome de exibição para cada chave do META_ACCOUNTS
const DISPLAY_NAMES: Record<string, string> = {
  // Yamcol
  'stanley':        'Stanley Boulevard',
  'tommy':          'Tommy Hilfiger',
  'milon':          'Milon Boulevard',
  'taco':           'Taco Boulevard',
  'vh-boulevard':   'Victor Hugo Boulevard',
  'vh-bosque':      'Victor Hugo Bosque',
  'vh-fortaleza':   'Victor Hugo Fortaleza',
  'vh-ribeirao':    'Victor Hugo Ribeirão Preto',
  'vh-manauara':    'Victor Hugo Manauara',
  'osklen-manaus':  'Osklen Manaus',
  'osklen-pvh':     'Osklen Porto Velho',
  'plie':           'Plié Boulevard',
  // Barbosa
  'barbosa-calcados': 'Barbosa Calçados',
  'arezzo':           'Arezzo GV',
  'sirigaita':        'Sirigaita Calçados',
  'zoom':             'Zoom Calçados',
  'flags':            'Flags Calçados',
  // Paralelas
  'paralelas-dom-luis':   'Paralelas Dom Luís',
  'paralelas-monumental': 'Paralelas Monumental',
  'paralelas-reserva':    'Paralelas Reserva',
  // Ferracini
  'ferracini-americana':    'Ferracini Americana',
  'ferracini-valinhos':     'Ferracini Valinhos',
  'ferracini-piracicaba':   'Ferracini Piracicaba',
  'ferracini-villa-romana': 'Ferracini Florianópolis',
  // Lupo
  'lupo-boa-vista':   'Lupo Boa Vista',
  'lupo-carrefour':   'Lupo Carrefour',
  'lupo-manauara':    'Lupo Manauara',
  'lupo-ponta-negra': 'Lupo Ponta Negra',
  'lupo-sao-caetano': 'Lupo São Caetano',
  'lupo-sports':      'Lupo Sport',
  'lupo-sumauma':     'Lupo Sumaúma',
  // Avulsos
  'amo-outlet':          'Amo Outlet',
  'anjo-colours':        'Anjo Colours',
  'b201':                'B 201 Calçados',
  'carrano':             'Carrano',
  'democrata-rio-verde': 'Democrata Rio Verde',
  'guapa':               'Guapa',
  'kipasso':             'Kipasso Calçados',
  'mega-calcados':       'Mega Calçados',
  'sergios':             "Sergio's",
};

// Contas com múltiplas lojas: cada loja filtra por keyword no nome de campanha
// Padrão dos clientes: [PONTA NEGRA], [SUMAUMA], [MANAUARA], [BOSQUE], [BOULEVARD]
const MULTI_STORE_GROUPS = [
  {
    accountId: META_ACCOUNTS['lupo-manauara'], // act_1908312336258416
    stores: [
      { key: 'lupo-manauara',    name: 'Lupo Manauara',    nameFilter: 'MANAUARA'    },
      { key: 'lupo-ponta-negra', name: 'Lupo Ponta Negra', nameFilter: 'PONTA NEGRA' },
      { key: 'lupo-sumauma',     name: 'Lupo Sumaúma',     nameFilter: 'SUMAUMA'     },
    ],
  },
  {
    accountId: META_ACCOUNTS['vh-boulevard'], // act_739663585617111
    stores: [
      { key: 'vh-boulevard', name: 'Victor Hugo Boulevard', nameFilter: 'BOULEVARD' },
      { key: 'vh-bosque',    name: 'Victor Hugo Bosque',    nameFilter: 'BOSQUE'    },
    ],
  },
];

const MULTI_STORE_KEYS = new Set(
  MULTI_STORE_GROUPS.flatMap(g => g.stores.map(s => s.key)),
);

interface StoreEntry {
  key:         string;
  name:        string;
  accountId:   string;
  nameFilter?: string;
}

// Lojas de conta única
const SINGLE_STORE_ENTRIES: StoreEntry[] = Object.entries(META_ACCOUNTS)
  .filter(([key]) => !MULTI_STORE_KEYS.has(key))
  .map(([key, accountId]) => ({
    key,
    name: DISPLAY_NAMES[key] ?? key,
    accountId,
  }));

// Lojas de conta compartilhada (com filtro por nome de campanha)
const MULTI_STORE_ENTRIES: StoreEntry[] = MULTI_STORE_GROUPS.flatMap(g =>
  g.stores.map(s => ({ ...s, accountId: g.accountId })),
);

const ALL_STORES: StoreEntry[] = [
  ...SINGLE_STORE_ENTRIES,
  ...MULTI_STORE_ENTRIES,
].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

// ─── Formatação ───────────────────────────────────────────────────────────────

type StoreState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'done'; data: FeedbackData }
  | { status: 'empty' }
  | { status: 'error'; message: string };

function fmtBRL(value: number): string {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function fmtNumber(n: number): string {
  return n.toLocaleString('pt-BR');
}

function buildMessage(name: string, data: FeedbackData): string {
  const dateRange = `(${fmtDate(data.dateStart)} a ${fmtDate(data.dateStop)})`;
  const lines: string[] = [
    `Olá pessoal! Excelente sexta-feira para todos!🚀`,
    `📆 Passando para mostrar os investimentos e resultados desses últimos 7 dias.`,
    dateRange,
    `🔵No Meta🔵`,
    `Total Investido: R$ ${fmtBRL(data.totalSpend)}`,
  ];

  if (data.mensagem) {
    lines.push(`💵Investimento Mensagem: R$ ${fmtBRL(data.mensagem.spend)}`);
    lines.push(`🎯 Mensagens: ${fmtNumber(data.mensagem.mensagens)}`);
    lines.push(`💲Custo por mensagem: R$ ${fmtBRL(data.mensagem.custoMensagem)}`);
  }

  if (data.secundaria) {
    const sec = data.secundaria;
    if (sec.tipo === 'impulsionamento') {
      lines.push(`💵Investimento Impulsionamento: R$ ${fmtBRL(sec.spend)}`);
      lines.push(`👀Visitas ao Perfil: ${fmtNumber(sec.visitasPerfil)}`);
      lines.push(`💲Custo por Visita: R$ ${fmtBRL(sec.custoVisita)}`);
    } else {
      lines.push(`💵Investimento Reconhecimento: R$ ${fmtBRL(sec.spend)}`);
      lines.push(`👀Pessoas Alcançadas: ${fmtNumber(sec.pessoasAlcancadas)}`);
    }
  }

  return lines.join('\n');
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function MetaFeedbackView() {
  const [states, setStates] = useState<Record<string, StoreState>>(() =>
    Object.fromEntries(ALL_STORES.map(s => [s.key, { status: 'idle' }])),
  );
  const [copied, setCopied] = useState<Record<string, boolean>>({});
  const [running, setRunning] = useState(false);

  const setStore = useCallback((key: string, state: StoreState) => {
    setStates(prev => ({ ...prev, [key]: state }));
  }, []);

  const fetchAll = useCallback(async () => {
    setRunning(true);
    setStates(Object.fromEntries(ALL_STORES.map(s => [s.key, { status: 'loading' }])));

    await Promise.all(
      ALL_STORES.map(async ({ key, accountId, nameFilter }) => {
        try {
          const data = await getAccountFeedbackData(accountId, nameFilter);
          setStore(key, data ? { status: 'done', data } : { status: 'empty' });
        } catch (err: any) {
          setStore(key, { status: 'error', message: err?.message ?? 'Erro desconhecido' });
        }
      }),
    );

    setRunning(false);
  }, [setStore]);

  const copyText = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(prev => ({ ...prev, [key]: true }));
    setTimeout(() => setCopied(prev => ({ ...prev, [key]: false })), 2000);
  };

  const doneCount  = ALL_STORES.filter(s => states[s.key]?.status === 'done').length;
  const emptyCount = ALL_STORES.filter(s => states[s.key]?.status === 'empty').length;
  const errorCount = ALL_STORES.filter(s => states[s.key]?.status === 'error').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Feedbacks Meta</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gera as mensagens de resultado dos últimos 7 dias para todos os clientes.
          </p>
        </div>
        <button
          onClick={fetchAll}
          disabled={running}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-purple hover:bg-brand-purple/80 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${running ? 'animate-spin' : ''}`} />
          {running ? 'Buscando…' : 'Gerar Feedbacks'}
        </button>
      </div>

      {/* Resumo */}
      {!running && doneCount > 0 && (
        <div className="flex gap-4 text-xs">
          <span className="text-green-400 font-bold">{doneCount} gerados</span>
          {emptyCount > 0 && <span className="text-gray-500 font-bold">{emptyCount} sem gasto</span>}
          {errorCount > 0 && <span className="text-red-400 font-bold">{errorCount} com erro</span>}
        </div>
      )}

      {/* Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {ALL_STORES.map(({ key, name }) => {
          const state = states[key];
          const message = state.status === 'done' ? buildMessage(name, state.data) : '';

          return (
            <div
              key={key}
              className="bg-brand-medium border border-brand-light rounded-xl p-4 flex flex-col gap-3"
            >
              {/* Store header */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-brand-purple shrink-0" />
                  <span className="text-sm font-bold text-white">{name}</span>
                </div>
                {state.status === 'done' && (
                  <button
                    onClick={() => copyText(key, message)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-brand-light hover:bg-brand-light/80 text-xs font-bold transition-all"
                  >
                    {copied[key]
                      ? <><Check className="w-3.5 h-3.5 text-green-400" /><span className="text-green-400">Copiado!</span></>
                      : <><Copy className="w-3.5 h-3.5 text-gray-400" /><span className="text-gray-300">Copiar</span></>
                    }
                  </button>
                )}
              </div>

              {/* Content */}
              {state.status === 'idle' && (
                <p className="text-xs text-gray-600 italic">Clique em "Gerar Feedbacks" para buscar.</p>
              )}
              {state.status === 'loading' && (
                <div className="space-y-2 animate-pulse">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-3 bg-brand-light rounded" style={{ width: `${60 + (i % 3) * 15}%` }} />
                  ))}
                </div>
              )}
              {state.status === 'empty' && (
                <p className="text-xs text-gray-500 italic">Sem gasto nos últimos 7 dias.</p>
              )}
              {state.status === 'error' && (
                <p className="text-xs text-red-400">Erro: {state.message}</p>
              )}
              {state.status === 'done' && (
                <pre className="text-xs text-gray-300 whitespace-pre-wrap leading-relaxed font-sans bg-brand-dark/50 rounded-lg p-3 border border-brand-light">
                  {message}
                </pre>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
