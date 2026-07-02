// ─── GRUPO FERRACINI ─────────────────────────────────────────────────────────
// Fee: R$ 1.700/loja (Americana, Valinhos, Piracicaba) | R$ 1.997 (Villa Romana)
// Período: início em Mar/26 (Villa Romana desde Fev/26)

import { GroupData } from '../types';

export const FERRACINI: GroupData = {
  id: 'ferracini',
  name: 'Grupo Ferracini',
  color: '#8b5cf6',
  fee: 1700, // fee base — Villa Romana tem fee próprio definido no historico via verba
  stores: [

    // ── FERRACINI AMERICANA ───────────────────────────────────────────────
    {
      id: 'ferracini-americana',
      name: 'Ferracini Americana',
      color: '#8b5cf6',
      fee: 1700,
      historico: [
        { mes:'Mar/26', chave:'2026-03', vendas:0,       faturamentoLoja:10524.31, conversao:0,    mensagens:83,  qtdVendas:0, ticketMedio:0,      pctAureFat:0,     verba:297.95 },
        { mes:'Abr/26', chave:'2026-04', vendas:2679.10, faturamentoLoja:25357.40, conversao:2.75, mensagens:218, qtdVendas:6, ticketMedio:446.52, pctAureFat:10.57, verba:814.03 },
      ],
      planos: [
        { tarefa:'Operação nova — Março sem conversão, Abril com primeiros resultados', status:'Alta' },
        { tarefa:'10,57% do faturamento em Abril via tráfego — tendência positiva', status:'Sucesso' },
        { tarefa:'Aumentar volume de mensagens para acelerar resultados', status:'Alta' },
        { tarefa:'Ticket médio alto (R$446) — público qualificado, manter segmentação', status:'Média' },
      ],
    },

    // ── FERRACINI VALINHOS ────────────────────────────────────────────────
    {
      id: 'ferracini-valinhos',
      name: 'Ferracini Valinhos',
      color: '#7c3aed',
      fee: 1700,
      historico: [
        { mes:'Mar/26', chave:'2026-03', vendas:769.70,  faturamentoLoja:48370.53, conversao:2.20, mensagens:91,  qtdVendas:2, ticketMedio:384.85, pctAureFat:1.59, verba:343.50 },
        { mes:'Abr/26', chave:'2026-04', vendas:3123.40, faturamentoLoja:38389.95, conversao:2.87, mensagens:209, qtdVendas:6, ticketMedio:520.57, pctAureFat:8.14, verba:824.54 },
      ],
      planos: [
        { tarefa:'Crescimento de 306% de Mar para Abr — tendência muito positiva', status:'Sucesso' },
        { tarefa:'Ticket médio crescendo (R$384 → R$520) — explorar produtos premium', status:'Alta' },
        { tarefa:'8,14% do faturamento em Abril — resultado expressivo para operation nova', status:'Sucesso' },
        { tarefa:'Manter cadência e aumentar volume de disparos', status:'Alta' },
      ],
    },

    // ── FERRACINI PIRACICABA ──────────────────────────────────────────────
    {
      id: 'ferracini-piracicaba',
      name: 'Ferracini Piracicaba',
      color: '#6d28d9',
      fee: 1700,
      historico: [
        { mes:'Mar/26', chave:'2026-03', vendas:0,       faturamentoLoja:0,        conversao:0,    mensagens:0,   qtdVendas:0, ticketMedio:0,      pctAureFat:0,    verba:477.91 },
        { mes:'Abr/26', chave:'2026-04', vendas:3019.10, faturamentoLoja:72296.49, conversao:4.00, mensagens:150, qtdVendas:6, ticketMedio:503.18, pctAureFat:4.18, verba:743.34 },
      ],
      planos: [
        { tarefa:'Março sem disparos — garantir continuidade a partir de Maio', status:'Alta' },
        { tarefa:'Primeiro mês com resultado (Abril) já com 4% conversão e R$503 ticket', status:'Sucesso' },
        { tarefa:'Aumentar frequência de disparos — potencial alto pelo faturamento da loja', status:'Alta' },
        { tarefa:'Replicar estratégia de Valinhos que cresceu mais rápido', status:'Média' },
      ],
    },

    // ── FERRACINI VILLA ROMANA ────────────────────────────────────────────
    {
      id: 'ferracini-villa-romana',
      name: 'Ferracini Villa Romana',
      color: '#a78bfa',
      fee: 1997,
      historico: [
        { mes:'Fev/26', chave:'2026-02', vendas:0,       faturamentoLoja:0,        conversao:0,    mensagens:37, qtdVendas:0, ticketMedio:0,      pctAureFat:0,    verba:368.84 },
        { mes:'Mar/26', chave:'2026-03', vendas:0,       faturamentoLoja:95981.46, conversao:0,    mensagens:62, qtdVendas:0, ticketMedio:0,      pctAureFat:0,    verba:597.82 },
        { mes:'Abr/26', chave:'2026-04', vendas:1659.60, faturamentoLoja:58677.80, conversao:8.47, mensagens:59, qtdVendas:5, ticketMedio:331.92, pctAureFat:2.83, verba:853.76 },
      ],
      planos: [
        { tarefa:'Fev e Mar sem conversão — Abril com 8,47% conversão indica virada', status:'Alta' },
        { tarefa:'Fee diferenciado R$1.997 — exige vendas maiores para cobrir custo', status:'Alta' },
        { tarefa:'Faturamento da loja alto (R$95k em Mar) — muito espaço para crescer', status:'Média' },
        { tarefa:'Aumentar volume de mensagens (59-62/mês é baixo para o potencial)', status:'Alta' },
      ],
    },

  ],
};
