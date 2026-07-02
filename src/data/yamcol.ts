// ─── GRUPO YAMCOL ────────────────────────────────────────────────────────────
// Para adicionar novos meses: copie um objeto MonthData e atualize os campos.
// Para adicionar nova loja: copie o bloco de uma loja existente.

import { GroupData } from '../types';

export const YAMCOL: GroupData = {
  id: 'yamcol',
  name: 'Grupo Yamcol',
  color: '#7c3aed',
  fee: 1500,
  stores: [

    // ── STANLEY BOULEVARD ──────────────────────────────────────────────────
    {
      id: 'stanley',
      name: 'Stanley Boulevard',
      color: '#7c3aed',
      historico: [
        { mes:'Set/25', chave:'2025-09', vendas:0,       faturamentoLoja:36382.50,  conversao:0,    mensagens:221, qtdVendas:0, ticketMedio:0,      pctAureFat:0,    verba:700.55  },
        { mes:'Out/25', chave:'2025-10', vendas:1632,    faturamentoLoja:113462.95, conversao:0.79, mensagens:381, qtdVendas:3, ticketMedio:544,    pctAureFat:1.44, verba:1115.95 },
        { mes:'Nov/25', chave:'2025-11', vendas:1433,    faturamentoLoja:46693.55,  conversao:1.38, mensagens:218, qtdVendas:3, ticketMedio:477.67, pctAureFat:3.07, verba:1265.56 },
        { mes:'Dez/25', chave:'2025-12', vendas:0,       faturamentoLoja:180550.35, conversao:0,    mensagens:359, qtdVendas:0, ticketMedio:0,      pctAureFat:0,    verba:1880.86 },
        { mes:'Jan/26', chave:'2026-01', vendas:383,     faturamentoLoja:83536.63,  conversao:1.04, mensagens:96,  qtdVendas:1, ticketMedio:383,    pctAureFat:0.46, verba:456.82  },
        { mes:'Fev/26', chave:'2026-02', vendas:0,       faturamentoLoja:0,         conversao:0,    mensagens:214, qtdVendas:0, ticketMedio:0,      pctAureFat:0,    verba:1054.22 },
        { mes:'Mar/26', chave:'2026-03', vendas:2274.10, faturamentoLoja:72670.19,  conversao:4.43, mensagens:203, qtdVendas:9, ticketMedio:252.68, pctAureFat:3.13, verba:1055.02 },
        { mes:'Abr/26', chave:'2026-04', vendas:1804.30, faturamentoLoja:70515.65,  conversao:3.70, mensagens:135, qtdVendas:5, ticketMedio:360.86, pctAureFat:4.34, verba:846.58  },
        { mes:'Mai/26', chave:'2026-05', vendas:1349.30, faturamentoLoja:53068.20,  conversao:3.31, mensagens:151, qtdVendas:5, ticketMedio:269.86, pctAureFat:2.54, verba:919.99  },
      ],
      planos: [
        { tarefa:'Reconhecimento no shopping — disparos focados em público local', status:'Alta' },
        { tarefa:'Fortalecer Grupo VIP com conteúdo exclusivo', status:'Alta' },
        { tarefa:'Volume alto de mensagens — principal motor de conversão desta loja', status:'Alta' },
        { tarefa:'Ações sazonais: Namorados, Dia dos Pais, Black Friday', status:'Média' },
      ],
    },

    // ── TOMMY HILFIGER ─────────────────────────────────────────────────────
    {
      id: 'tommy',
      name: 'Tommy Hilfiger',
      color: '#22c55e',
      historico: [
        { mes:'Jul/25', chave:'2025-07', vendas:404,     faturamentoLoja:54382.22,  conversao:1.43, mensagens:70,  qtdVendas:1,  ticketMedio:404,    pctAureFat:0.74,  verba:417.08  },
        { mes:'Ago/25', chave:'2025-08', vendas:6497.79, faturamentoLoja:64539.16,  conversao:4.63, mensagens:216, qtdVendas:10, ticketMedio:649.78, pctAureFat:10.07, verba:1013.34 },
        { mes:'Set/25', chave:'2025-09', vendas:3105.01, faturamentoLoja:60365.62,  conversao:2.91, mensagens:344, qtdVendas:10, ticketMedio:310.50, pctAureFat:5.14,  verba:1499.90 },
        { mes:'Out/25', chave:'2025-10', vendas:6395.31, faturamentoLoja:109821.21, conversao:2.35, mensagens:341, qtdVendas:8,  ticketMedio:799.41, pctAureFat:5.82,  verba:1241.26 },
        { mes:'Nov/25', chave:'2025-11', vendas:5287.85, faturamentoLoja:72093.75,  conversao:4.12, mensagens:388, qtdVendas:16, ticketMedio:330.49, pctAureFat:7.33,  verba:1385.94 },
        { mes:'Dez/25', chave:'2025-12', vendas:0,       faturamentoLoja:152459.06, conversao:0,    mensagens:641, qtdVendas:0,  ticketMedio:0,      pctAureFat:0,     verba:2601.84 },
        { mes:'Jan/26', chave:'2026-01', vendas:2274.20, faturamentoLoja:87495,     conversao:7.55, mensagens:53,  qtdVendas:4,  ticketMedio:568.55, pctAureFat:2.60,  verba:429.79  },
        { mes:'Fev/26', chave:'2026-02', vendas:0,       faturamentoLoja:0,         conversao:0,    mensagens:0,   qtdVendas:0,  ticketMedio:0,      pctAureFat:0,     verba:0       },
        { mes:'Mar/26', chave:'2026-03', vendas:3508.40, faturamentoLoja:121498.01, conversao:5.39, mensagens:167, qtdVendas:9,  ticketMedio:389.82, pctAureFat:2.89,  verba:1068.53 },
        { mes:'Abr/26', chave:'2026-04', vendas:5087.40, faturamentoLoja:118674.62, conversao:25,   mensagens:32,  qtdVendas:8,  ticketMedio:635.93, pctAureFat:4.29,  verba:343.38  },
        { mes:'Mai/26', chave:'2026-05', vendas:5151.90, faturamentoLoja:121302.43, conversao:5.66, mensagens:106, qtdVendas:6,  ticketMedio:858.65, pctAureFat:4.25,  verba:902.77  },
      ],
      planos: [
        { tarefa:'Focar no Grupo VIP — fonte dos 25% de conversão em Abril', status:'Alta' },
        { tarefa:'Testar landing page de captação para o Grupo VIP', status:'Teste' },
        { tarefa:'Testar guia interativo de presentes para o Dia dos Namorados', status:'Teste' },
        { tarefa:'Manter disparos segmentados', status:'Alta' },
      ],
    },

    // ── MILON BOULEVARD ────────────────────────────────────────────────────
    {
      id: 'milon',
      name: 'Milon Boulevard',
      color: '#f59e0b',
      historico: [
        { mes:'Set/25', chave:'2025-09', vendas:705,     faturamentoLoja:119482.87, conversao:1.54, mensagens:130, qtdVendas:2,  ticketMedio:352.50, pctAureFat:0.59, verba:700.55  },
        { mes:'Out/25', chave:'2025-10', vendas:3003.60, faturamentoLoja:207843.43, conversao:2.58, mensagens:155, qtdVendas:4,  ticketMedio:750.90, pctAureFat:1.45, verba:1138.17 },
        { mes:'Nov/25', chave:'2025-11', vendas:4283.32, faturamentoLoja:142380.33, conversao:4.78, mensagens:251, qtdVendas:12, ticketMedio:356.94, pctAureFat:3.01, verba:1174.29 },
        { mes:'Dez/25', chave:'2025-12', vendas:0,       faturamentoLoja:422726.34, conversao:0,    mensagens:364, qtdVendas:0,  ticketMedio:0,      pctAureFat:0,    verba:1895.15 },
        { mes:'Jan/26', chave:'2026-01', vendas:1379.18, faturamentoLoja:166909.12, conversao:3.96, mensagens:101, qtdVendas:4,  ticketMedio:344.80, pctAureFat:0.83, verba:724.10  },
        { mes:'Fev/26', chave:'2026-02', vendas:4858.50, faturamentoLoja:75358.35,  conversao:7.32, mensagens:123, qtdVendas:9,  ticketMedio:539.83, pctAureFat:6.45, verba:1064.60 },
        { mes:'Mar/26', chave:'2026-03', vendas:2185.90, faturamentoLoja:145121.85, conversao:1.69, mensagens:296, qtdVendas:5,  ticketMedio:437.18, pctAureFat:1.51, verba:1332.11 },
        { mes:'Abr/26', chave:'2026-04', vendas:2176,    faturamentoLoja:187362.61, conversao:2.20, mensagens:182, qtdVendas:4,  ticketMedio:544,    pctAureFat:1.16, verba:874.49  },
        { mes:'Mai/26', chave:'2026-05', vendas:2556.27, faturamentoLoja:159601.38, conversao:11.69,mensagens:77,  qtdVendas:9,  ticketMedio:284.03, pctAureFat:1.60, verba:663.62  },
      ],
      planos: [
        { tarefa:'Aumentar volume de disparos — CMV alto exige mais vendas', status:'Alta' },
        { tarefa:'Ações sazonais com kits e combos', status:'Média' },
        { tarefa:'Diversificar criativos: testar vídeo curto', status:'Média' },
      ],
    },

    // ── TACO BOULEVARD ─────────────────────────────────────────────────────
    {
      id: 'taco',
      name: 'Taco Boulevard',
      color: '#06b6d4',
      historico: [
        { mes:'Out/25', chave:'2025-10', vendas:1166,    faturamentoLoja:228296.10, conversao:4.26, mensagens:188, qtdVendas:8,  ticketMedio:145.75, pctAureFat:0.51, verba:1031.65 },
        { mes:'Nov/25', chave:'2025-11', vendas:3338.77, faturamentoLoja:116690.67, conversao:6.56, mensagens:183, qtdVendas:12, ticketMedio:278.23, pctAureFat:2.86, verba:0       },
        { mes:'Dez/25', chave:'2025-12', vendas:8066,    faturamentoLoja:569333.20, conversao:0,    mensagens:437, qtdVendas:0,  ticketMedio:0,      pctAureFat:1.42, verba:1808.02 },
        { mes:'Jan/26', chave:'2026-01', vendas:2022,    faturamentoLoja:167731,    conversao:4.55, mensagens:132, qtdVendas:6,  ticketMedio:337,    pctAureFat:1.21, verba:910.55  },
        { mes:'Fev/26', chave:'2026-02', vendas:3750,    faturamentoLoja:0,         conversao:16.38,mensagens:116, qtdVendas:19, ticketMedio:197.37, pctAureFat:0,    verba:1153.70 },
        { mes:'Mar/26', chave:'2026-03', vendas:4802.48, faturamentoLoja:144615.48, conversao:6.24, mensagens:433, qtdVendas:27, ticketMedio:177.87, pctAureFat:3.32, verba:1189.31 },
        { mes:'Abr/26', chave:'2026-04', vendas:4778.50, faturamentoLoja:187731.78, conversao:5.81, mensagens:241, qtdVendas:14, ticketMedio:341.32, pctAureFat:2.55, verba:864.88  },
        { mes:'Mai/26', chave:'2026-05', vendas:3572.34, faturamentoLoja:140557.39, conversao:6.67, mensagens:345, qtdVendas:23, ticketMedio:155.32, pctAureFat:2.54, verba:892.56  },
      ],
      planos: [
        { tarefa:'Manter cadência de disparos — ROI positivo consistente', status:'Alta' },
        { tarefa:'Explorar Dezembro — maior faturamento da loja', status:'Alta' },
        { tarefa:'Aumentar ticket médio com kits e combos', status:'Média' },
      ],
    },

    // ── VH BOULEVARD ───────────────────────────────────────────────────────
    {
      id: 'vh-boulevard',
      name: 'VH Boulevard',
      color: '#ec4899',
      historico: [
        { mes:'Jul/25', chave:'2025-07', vendas:3615,     faturamentoLoja:237195.89, conversao:0.67, mensagens:150, qtdVendas:1,  ticketMedio:3615,    pctAureFat:1.52,  verba:1368.80 },
        { mes:'Ago/25', chave:'2025-08', vendas:6186,     faturamentoLoja:259758.45, conversao:0.60, mensagens:332, qtdVendas:2,  ticketMedio:3093,    pctAureFat:2.38,  verba:1397.04 },
        { mes:'Set/25', chave:'2025-09', vendas:49449,    faturamentoLoja:243022.35, conversao:9.66, mensagens:145, qtdVendas:14, ticketMedio:3532.07, pctAureFat:20.35, verba:1430.87 },
        { mes:'Out/25', chave:'2025-10', vendas:23844,    faturamentoLoja:290839.28, conversao:6.54, mensagens:107, qtdVendas:7,  ticketMedio:3406.29, pctAureFat:8.20,  verba:1736.98 },
        { mes:'Nov/25', chave:'2025-11', vendas:61666,    faturamentoLoja:348743.93, conversao:7.66, mensagens:248, qtdVendas:19, ticketMedio:3245.58, pctAureFat:17.68, verba:2287.66 },
        { mes:'Dez/25', chave:'2025-12', vendas:85595,    faturamentoLoja:819904.90, conversao:5.19, mensagens:443, qtdVendas:23, ticketMedio:3721.52, pctAureFat:10.44, verba:5890.73 },
        { mes:'Jan/26', chave:'2026-01', vendas:38381.20, faturamentoLoja:266850.38, conversao:5.56, mensagens:198, qtdVendas:11, ticketMedio:3489.20, pctAureFat:14.38, verba:2491.70 },
        { mes:'Fev/26', chave:'2026-02', vendas:73967,    faturamentoLoja:258283.05, conversao:7.38, mensagens:244, qtdVendas:18, ticketMedio:4109.28, pctAureFat:34.23, verba:3798.86 },
        { mes:'Mar/26', chave:'2026-03', vendas:30877.41, faturamentoLoja:332614.94, conversao:7.06, mensagens:170, qtdVendas:12, ticketMedio:2573.12, pctAureFat:9.28,  verba:3374.26 },
        { mes:'Abr/26', chave:'2026-04', vendas:13276.25, faturamentoLoja:258283.05, conversao:3.13, mensagens:96,  qtdVendas:3,  ticketMedio:4425.42, pctAureFat:5.72,  verba:1625.97 },
        { mes:'Mai/26', chave:'2026-05', vendas:14352.70, faturamentoLoja:459247.43, conversao:3.48, mensagens:115, qtdVendas:4,  ticketMedio:3588.18, pctAureFat:3.13,  verba:2037.74 },
      ],
      planos: [
        { tarefa:'Manter e escalar disparos — ROI positivo consistente', status:'Alta' },
        { tarefa:'Ticket médio alto — focar em curadoria e exclusividade', status:'Alta' },
        { tarefa:'Recuperar performance de Abril', status:'Alta' },
      ],
    },

    // ── VH BOSQUE ──────────────────────────────────────────────────────────
    {
      id: 'vh-bosque',
      name: 'VH Bosque',
      color: '#8b5cf6',
      historico: [
        { mes:'Out/25', chave:'2025-10', vendas:3693,     faturamentoLoja:229373.86, conversao:1.56, mensagens:64,  qtdVendas:1,  ticketMedio:3693,    pctAureFat:1.61,  verba:1097.32 },
        { mes:'Nov/25', chave:'2025-11', vendas:0,        faturamentoLoja:294424.95, conversao:0,    mensagens:47,  qtdVendas:0,  ticketMedio:0,       pctAureFat:0,     verba:1809.72 },
        { mes:'Dez/25', chave:'2025-12', vendas:70743,    faturamentoLoja:650073.96, conversao:16,   mensagens:100, qtdVendas:16, ticketMedio:4421.44, pctAureFat:10.88, verba:2870.88 },
        { mes:'Jan/26', chave:'2026-01', vendas:9648,     faturamentoLoja:213397.05, conversao:3.45, mensagens:58,  qtdVendas:2,  ticketMedio:4824,    pctAureFat:4.90,  verba:1315.79 },
        { mes:'Fev/26', chave:'2026-02', vendas:20335,    faturamentoLoja:213397.05, conversao:8.47, mensagens:118, qtdVendas:10, ticketMedio:2033.50, pctAureFat:10.91, verba:2920.69 },
        { mes:'Mar/26', chave:'2026-03', vendas:16241.50, faturamentoLoja:227133.99, conversao:4.65, mensagens:86,  qtdVendas:4,  ticketMedio:4060.38, pctAureFat:7.15,  verba:2309.66 },
        { mes:'Abr/26', chave:'2026-04', vendas:9368.90,  faturamentoLoja:213397.05, conversao:2.86, mensagens:70,  qtdVendas:2,  ticketMedio:4684.45, pctAureFat:4.82,  verba:1007.97 },
        { mes:'Mai/26', chave:'2026-05', vendas:4775,     faturamentoLoja:394029.14, conversao:1.22, mensagens:82,  qtdVendas:1,  ticketMedio:4775,    pctAureFat:1.21,  verba:1089.57 },
      ],
      planos: [
        { tarefa:'Manter disparos — ROI positivo desde Jan/26', status:'Alta' },
        { tarefa:'Ticket médio R$4k+ — foco em curadoria premium', status:'Alta' },
        { tarefa:'Dezembro é o mês pico — preparar antecipado', status:'Média' },
      ],
    },

    // ── VH FORTALEZA ───────────────────────────────────────────────────────
    {
      id: 'vh-fortaleza',
      name: 'VH Fortaleza',
      color: '#f97316',
      historico: [
        { mes:'Out/25', chave:'2025-10', vendas:0,      faturamentoLoja:104174.42, conversao:0,    mensagens:89,  qtdVendas:0, ticketMedio:0,     pctAureFat:0,    verba:864.39  },
        { mes:'Nov/25', chave:'2025-11', vendas:2798,   faturamentoLoja:150322.93, conversao:0.92, mensagens:109, qtdVendas:1, ticketMedio:2798,  pctAureFat:1.86, verba:981.96  },
        { mes:'Dez/25', chave:'2025-12', vendas:0,      faturamentoLoja:0,         conversao:0,    mensagens:154, qtdVendas:0, ticketMedio:0,     pctAureFat:0,    verba:1371.22 },
        { mes:'Jan/26', chave:'2026-01', vendas:0,      faturamentoLoja:200004.95, conversao:0,    mensagens:79,  qtdVendas:0, ticketMedio:0,     pctAureFat:0,    verba:701.86  },
        { mes:'Fev/26', chave:'2026-02', vendas:1630,   faturamentoLoja:71084,     conversao:0.93, mensagens:107, qtdVendas:1, ticketMedio:1630,  pctAureFat:2.29, verba:1051.87 },
        { mes:'Mar/26', chave:'2026-03', vendas:695,    faturamentoLoja:122416.43, conversao:2.55, mensagens:157, qtdVendas:4, ticketMedio:173.75,pctAureFat:0.57, verba:1056.49 },
        { mes:'Abr/26', chave:'2026-04', vendas:644.30, faturamentoLoja:126067.79, conversao:0.84, mensagens:119, qtdVendas:1, ticketMedio:644.30,pctAureFat:0.66, verba:846.29  },
        { mes:'Mai/26', chave:'2026-05', vendas:6170,    faturamentoLoja:188913.24, conversao:2.30, mensagens:87,  qtdVendas:2, ticketMedio:3085,  pctAureFat:3.27, verba:800.71  },
      ],
      planos: [
        { tarefa:'Testar landing page de Grupo VIP para captação', status:'Teste' },
        { tarefa:'Testar guia interativo de vendas (Dia dos Namorados)', status:'Teste' },
        { tarefa:'Disparos para base inativa — alto potencial', status:'Alta' },
        { tarefa:'Revisão de segmentação completa', status:'Alta' },
      ],
    },

    // ── VH RIBEIRÃO PRETO ──────────────────────────────────────────────────
    {
      id: 'vh-ribeirao',
      name: 'VH Ribeirão Preto',
      color: '#14b8a6',
      historico: [
        { mes:'Jan/26', chave:'2026-01', vendas:0,       faturamentoLoja:0,          conversao:0,  mensagens:0,  qtdVendas:0, ticketMedio:0,       pctAureFat:0,    verba:279.96  },
        { mes:'Fev/26', chave:'2026-02', vendas:8831.90, faturamentoLoja:148295.28,  conversao:15, mensagens:20, qtdVendas:3, ticketMedio:2943.97, pctAureFat:5.96, verba:553.18  },
        { mes:'Mar/26', chave:'2026-03', vendas:0,       faturamentoLoja:193791.40,  conversao:0,  mensagens:32, qtdVendas:0, ticketMedio:0,       pctAureFat:0,    verba:1177.30 },
        { mes:'Abr/26', chave:'2026-04', vendas:0,       faturamentoLoja:145954.93,  conversao:0,  mensagens:49, qtdVendas:0, ticketMedio:0,       pctAureFat:0,    verba:1043.24 },
      ],
      planos: [
        { tarefa:'Operação nova — construir base de contatos urgentemente', status:'Alta' },
        { tarefa:'Aumentar volume de mensagens (apenas 20-49/mês)', status:'Alta' },
        { tarefa:'15% de conversão em Fev — escalar base qualificada', status:'Alta' },
      ],
    },

    // ── OSKLEN MANAUS ──────────────────────────────────────────────────────
    {
      id: 'osklen-manaus',
      name: 'Osklen Manaus',
      color: '#a78bfa',
      historico: [
        { mes:'Fev/26', chave:'2026-02', vendas:2893.60, faturamentoLoja:91026.53,  conversao:6.60, mensagens:106, qtdVendas:7, ticketMedio:413.37, pctAureFat:3.18, verba:958.12  },
        { mes:'Mar/26', chave:'2026-03', vendas:2173.59, faturamentoLoja:195811.81, conversao:2.11, mensagens:142, qtdVendas:3, ticketMedio:724.53, pctAureFat:1.11, verba:1150.32 },
        { mes:'Abr/26', chave:'2026-04', vendas:3686.60, faturamentoLoja:147119.14, conversao:9.09, mensagens:77,  qtdVendas:7, ticketMedio:526.66, pctAureFat:3.22, verba:878.52  },
      ],
      planos: [
        { tarefa:'Manter cadência de disparos', status:'Alta' },
        { tarefa:'Escalar ações de sucesso — Abril com menos msgs e mais resultado', status:'Alta' },
        { tarefa:'Testar guia interativo de presentes', status:'Teste' },
      ],
    },

    // ── OSKLEN PORTO VELHO ─────────────────────────────────────────────────
    {
      id: 'osklen-pvh',
      name: 'Osklen Porto Velho',
      color: '#ef4444',
      historico: [
        { mes:'Fev/26', chave:'2026-02', vendas:515,     faturamentoLoja:31385.60,  conversao:3.75, mensagens:80, qtdVendas:3, ticketMedio:171.67, pctAureFat:1.64,  verba:1405.64 },
        { mes:'Mar/26', chave:'2026-03', vendas:2134,    faturamentoLoja:58003.80,  conversao:4.62, mensagens:65, qtdVendas:3, ticketMedio:711.33, pctAureFat:3.68,  verba:1153.53 },
        { mes:'Abr/26', chave:'2026-04', vendas:7256.60, faturamentoLoja:60000.08,  conversao:20,   mensagens:40, qtdVendas:8, ticketMedio:907.08, pctAureFat:16.32, verba:879.29  },
        { mes:'Mai/26', chave:'2026-05', vendas:2619,    faturamentoLoja:54998.05,  conversao:11.43,mensagens:35, qtdVendas:4, ticketMedio:654.75, pctAureFat:4.76,  verba:651.61  },
      ],
      planos: [
        { tarefa:'Escalar os disparos — +1.310% em 3 meses', status:'Alta' },
        { tarefa:'Diversificar criativos para evitar fadiga', status:'Média' },
        { tarefa:'Usar como modelo interno para outras lojas', status:'Média' },
      ],
    },

    // ── PLIÉ BOULEVARD ─────────────────────────────────────────────────────
    {
      id: 'plie',
      name: 'Plié Boulevard',
      color: '#d946ef',
      historico: [
        { mes:'Jan/26', chave:'2026-01', vendas:3952.80, faturamentoLoja:87161.45,  conversao:3.65,  mensagens:219, qtdVendas:8,  ticketMedio:494.10, pctAureFat:4.54, verba:865.23  },
        { mes:'Fev/26', chave:'2026-02', vendas:3125.40, faturamentoLoja:48608.84,  conversao:3.57,  mensagens:196, qtdVendas:7,  ticketMedio:446.49, pctAureFat:6.43, verba:1133.65 },
        { mes:'Mar/26', chave:'2026-03', vendas:1688.20, faturamentoLoja:80078.74,  conversao:2.03,  mensagens:197, qtdVendas:4,  ticketMedio:422.05, pctAureFat:2.11, verba:1091.57 },
        { mes:'Abr/26', chave:'2026-04', vendas:5220.38, faturamentoLoja:62473.50,  conversao:11.83, mensagens:93,  qtdVendas:11, ticketMedio:474.58, pctAureFat:8.36, verba:574.42  },
      ],
      planos: [
        { tarefa:'Abril: melhor mês com menor volume — qualidade acima de quantidade', status:'Alta' },
        { tarefa:'Focar em segmentação — 11,83% conversão indica público certo', status:'Alta' },
        { tarefa:'Escalar o que funcionou em Abril', status:'Alta' },
      ],
    },
  ],
};
