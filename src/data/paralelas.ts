import { GroupData } from '../types';

export const PARALELAS: GroupData = {
  id: 'paralelas',
  name: 'Grupo Paralelas',
  color: '#f59e0b',
  fee: 1500,
  stores: [

    // ── PARALELAS RESERVA ─────────────────────────────────────────────────
    {
      id: 'paralelas-reserva',
      name: 'Paralelas Reserva',
      color: '#f59e0b',
      historico: [
        // 2025 — Jan a Mai sem dados de conversão (disparos iniciaram Jun)
        { mes:'Jan/25', chave:'2025-01', vendas:11103.45, faturamentoLoja:0, conversao:0,     mensagens:411, qtdVendas:0,  ticketMedio:0,      pctAureFat:0, verba:847.37  },
        { mes:'Fev/25', chave:'2025-02', vendas:10247.95, faturamentoLoja:0, conversao:0,     mensagens:131, qtdVendas:0,  ticketMedio:0,      pctAureFat:0, verba:999.02  },
        { mes:'Mar/25', chave:'2025-03', vendas:8929,     faturamentoLoja:0, conversao:0,     mensagens:150, qtdVendas:0,  ticketMedio:0,      pctAureFat:0, verba:1000    },
        { mes:'Abr/25', chave:'2025-04', vendas:15470.29, faturamentoLoja:0, conversao:0,     mensagens:221, qtdVendas:0,  ticketMedio:0,      pctAureFat:0, verba:1000    },
        { mes:'Mai/25', chave:'2025-05', vendas:15023,    faturamentoLoja:0, conversao:0,     mensagens:189, qtdVendas:0,  ticketMedio:0,      pctAureFat:0, verba:1000    },
        { mes:'Jun/25', chave:'2025-06', vendas:12145,    faturamentoLoja:0, conversao:27.65, mensagens:170, qtdVendas:47, ticketMedio:258.40, pctAureFat:0, verba:1210.75 },
        { mes:'Jul/25', chave:'2025-07', vendas:26423,    faturamentoLoja:0, conversao:58.43, mensagens:166, qtdVendas:97, ticketMedio:272.40, pctAureFat:0, verba:1053.48 },
        { mes:'Ago/25', chave:'2025-08', vendas:19060,    faturamentoLoja:0, conversao:26.87, mensagens:227, qtdVendas:61, ticketMedio:312.46, pctAureFat:0, verba:915.78  },
        { mes:'Set/25', chave:'2025-09', vendas:10389,    faturamentoLoja:0, conversao:8.76,  mensagens:251, qtdVendas:22, ticketMedio:472.23, pctAureFat:0, verba:992.04  },
        { mes:'Out/25', chave:'2025-10', vendas:15080.97, faturamentoLoja:0, conversao:10.41, mensagens:317, qtdVendas:33, ticketMedio:457,    pctAureFat:0, verba:1016.01 },
        { mes:'Nov/25', chave:'2025-11', vendas:12199,    faturamentoLoja:0, conversao:8.78,  mensagens:319, qtdVendas:28, ticketMedio:435.68, pctAureFat:0, verba:1056    },
        { mes:'Dez/25', chave:'2025-12', vendas:12096.14, faturamentoLoja:0, conversao:8.22,  mensagens:219, qtdVendas:18, ticketMedio:672.01, pctAureFat:0, verba:986.02  },
        // 2026
        { mes:'Jan/26', chave:'2026-01', vendas:26189.20, faturamentoLoja:0, conversao:57.18, mensagens:411, qtdVendas:235,ticketMedio:111.44, pctAureFat:0, verba:847.37  },
        { mes:'Fev/26', chave:'2026-02', vendas:15254.70, faturamentoLoja:0, conversao:7.74,  mensagens:439, qtdVendas:34, ticketMedio:448.67, pctAureFat:0, verba:999.02  },
        { mes:'Mar/26', chave:'2026-03', vendas:13590.91, faturamentoLoja:0, conversao:10.78, mensagens:371, qtdVendas:40, ticketMedio:339.77, pctAureFat:0, verba:970.58  },
        { mes:'Abr/26', chave:'2026-04', vendas:7461.80,  faturamentoLoja:0, conversao:5.16,  mensagens:368, qtdVendas:19, ticketMedio:392.73, pctAureFat:0, verba:1072.39 },
      ],
      planos: [
        { tarefa:'Melhor mês foi Julho/25 (58% conversão) — entender o que funcionou e replicar', status:'Alta' },
        { tarefa:'Jan/26 com 57% de conversão — estratégia de início de ano funcionou bem', status:'Alta' },
        { tarefa:'Manter cadência de disparos — conversão consistente acima de 5%', status:'Alta' },
        { tarefa:'Testar aumento de ticket médio — grande variação entre meses', status:'Média' },
      ],
    },

    // ── PARALELAS MONUMENTAL ──────────────────────────────────────────────
    {
      id: 'paralelas-monumental',
      name: 'Paralelas Monumental',
      color: '#d97706',
      historico: [
        { mes:'Jan/25', chave:'2025-01', vendas:11103.45, faturamentoLoja:0, conversao:0,     mensagens:170, qtdVendas:0,  ticketMedio:0,      pctAureFat:0, verba:847.37  },
        { mes:'Fev/25', chave:'2025-02', vendas:10247.95, faturamentoLoja:0, conversao:0,     mensagens:170, qtdVendas:0,  ticketMedio:0,      pctAureFat:0, verba:999.02  },
        { mes:'Mar/25', chave:'2025-03', vendas:8929,     faturamentoLoja:0, conversao:0,     mensagens:170, qtdVendas:0,  ticketMedio:0,      pctAureFat:0, verba:1000    },
        { mes:'Abr/25', chave:'2025-04', vendas:15470.29, faturamentoLoja:0, conversao:0,     mensagens:170, qtdVendas:0,  ticketMedio:0,      pctAureFat:0, verba:1000    },
        { mes:'Mai/25', chave:'2025-05', vendas:15023,    faturamentoLoja:0, conversao:0,     mensagens:170, qtdVendas:0,  ticketMedio:0,      pctAureFat:0, verba:1000    },
        { mes:'Jun/25', chave:'2025-06', vendas:12145,    faturamentoLoja:0, conversao:27.65, mensagens:170, qtdVendas:47, ticketMedio:258.40, pctAureFat:0, verba:1210.75 },
        { mes:'Jul/25', chave:'2025-07', vendas:26423,    faturamentoLoja:0, conversao:58.43, mensagens:166, qtdVendas:97, ticketMedio:272.40, pctAureFat:0, verba:1053.48 },
        { mes:'Ago/25', chave:'2025-08', vendas:19060,    faturamentoLoja:0, conversao:26.87, mensagens:227, qtdVendas:61, ticketMedio:312.46, pctAureFat:0, verba:915.78  },
        { mes:'Set/25', chave:'2025-09', vendas:10415,    faturamentoLoja:0, conversao:9.66,  mensagens:383, qtdVendas:37, ticketMedio:281.49, pctAureFat:0, verba:1058.17 },
        { mes:'Out/25', chave:'2025-10', vendas:14440,    faturamentoLoja:0, conversao:12.36, mensagens:364, qtdVendas:45, ticketMedio:320.89, pctAureFat:0, verba:1122.05 },
        { mes:'Nov/25', chave:'2025-11', vendas:12027,    faturamentoLoja:0, conversao:15.09, mensagens:232, qtdVendas:35, ticketMedio:343.63, pctAureFat:0, verba:1058.17 },
        { mes:'Dez/25', chave:'2025-12', vendas:20611,    faturamentoLoja:0, conversao:20.38, mensagens:265, qtdVendas:54, ticketMedio:381.69, pctAureFat:0, verba:1276.67 },
        // 2026
        { mes:'Jan/26', chave:'2026-01', vendas:11247,    faturamentoLoja:0, conversao:12.12, mensagens:297, qtdVendas:36, ticketMedio:312.42, pctAureFat:0, verba:847.37  },
        { mes:'Fev/26', chave:'2026-02', vendas:9478.42,  faturamentoLoja:0, conversao:8.84,  mensagens:396, qtdVendas:35, ticketMedio:270.81, pctAureFat:0, verba:1189.20 },
        { mes:'Mar/26', chave:'2026-03', vendas:12164,    faturamentoLoja:0, conversao:8.24,  mensagens:437, qtdVendas:36, ticketMedio:337.89, pctAureFat:0, verba:1015.97 },
        { mes:'Abr/26', chave:'2026-04', vendas:9385,     faturamentoLoja:0, conversao:10.09, mensagens:347, qtdVendas:35, ticketMedio:268.14, pctAureFat:0, verba:851     },
      ],
      planos: [
        { tarefa:'Dezembro/25 foi o melhor mês (20% conversão) — explorar sazonalidade', status:'Alta' },
        { tarefa:'Conversão consistente entre 8-15% em 2026 — manter estratégia atual', status:'Alta' },
        { tarefa:'Testar aumento de volume de mensagens — base responde bem', status:'Média' },
        { tarefa:'Replicar estratégia da Reserva (melhor conversão do grupo)', status:'Média' },
      ],
    },

    // ── PARALELAS DOM LUIS ────────────────────────────────────────────────
    {
      id: 'paralelas-dom-luis',
      name: 'Paralelas Dom Luís',
      color: '#b45309',
      historico: [
        { mes:'Jan/25', chave:'2025-01', vendas:5425.97,  faturamentoLoja:0, conversao:0,     mensagens:524, qtdVendas:0,  ticketMedio:0,      pctAureFat:0, verba:925     },
        { mes:'Fev/25', chave:'2025-02', vendas:3889.99,  faturamentoLoja:0, conversao:0,     mensagens:265, qtdVendas:0,  ticketMedio:0,      pctAureFat:0, verba:1010.69 },
        { mes:'Mar/25', chave:'2025-03', vendas:5735.95,  faturamentoLoja:0, conversao:0,     mensagens:458, qtdVendas:0,  ticketMedio:0,      pctAureFat:0, verba:993.78  },
        { mes:'Abr/25', chave:'2025-04', vendas:7927.96,  faturamentoLoja:0, conversao:0,     mensagens:443, qtdVendas:0,  ticketMedio:0,      pctAureFat:0, verba:983.33  },
        { mes:'Mai/25', chave:'2025-05', vendas:7627.96,  faturamentoLoja:0, conversao:0,     mensagens:410, qtdVendas:0,  ticketMedio:0,      pctAureFat:0, verba:1049.67 },
        { mes:'Jun/25', chave:'2025-06', vendas:10058.32, faturamentoLoja:0, conversao:0,     mensagens:318, qtdVendas:0,  ticketMedio:0,      pctAureFat:0, verba:688.56  },
        { mes:'Jul/25', chave:'2025-07', vendas:7014,     faturamentoLoja:0, conversao:5.66,  mensagens:618, qtdVendas:35, ticketMedio:200.40, pctAureFat:0, verba:1000    },
        { mes:'Ago/25', chave:'2025-08', vendas:0,        faturamentoLoja:0, conversao:0,     mensagens:376, qtdVendas:0,  ticketMedio:0,      pctAureFat:0, verba:884.28  },
        { mes:'Set/25', chave:'2025-09', vendas:6276,     faturamentoLoja:0, conversao:15.89, mensagens:151, qtdVendas:24, ticketMedio:261.50, pctAureFat:0, verba:905.47  },
        { mes:'Out/25', chave:'2025-10', vendas:13429,    faturamentoLoja:0, conversao:20.83, mensagens:216, qtdVendas:45, ticketMedio:298.42, pctAureFat:0, verba:710.03  },
        { mes:'Nov/25', chave:'2025-11', vendas:5888,     faturamentoLoja:0, conversao:9.35,  mensagens:278, qtdVendas:26, ticketMedio:226.46, pctAureFat:0, verba:1000    },
        { mes:'Dez/25', chave:'2025-12', vendas:15877,    faturamentoLoja:0, conversao:13.76, mensagens:298, qtdVendas:41, ticketMedio:387.24, pctAureFat:0, verba:897.54  },
        // 2026
        { mes:'Jan/26', chave:'2026-01', vendas:10208,    faturamentoLoja:0, conversao:19.38, mensagens:129, qtdVendas:25, ticketMedio:408.32, pctAureFat:0, verba:425.48  },
        { mes:'Fev/26', chave:'2026-02', vendas:3970.58,  faturamentoLoja:0, conversao:8.03,  mensagens:137, qtdVendas:11, ticketMedio:360.96, pctAureFat:0, verba:439.27  },
        { mes:'Mar/26', chave:'2026-03', vendas:8036,     faturamentoLoja:0, conversao:33,    mensagens:100, qtdVendas:33, ticketMedio:243.52, pctAureFat:0, verba:439.24  },
        { mes:'Abr/26', chave:'2026-04', vendas:6015,     faturamentoLoja:0, conversao:18.05, mensagens:133, qtdVendas:24, ticketMedio:250.63, pctAureFat:0, verba:439.23  },
      ],
      planos: [
        { tarefa:'Março/26 com 33% conversão com apenas 100 msgs — qualidade é chave aqui', status:'Alta' },
        { tarefa:'Reduzir volume e melhorar segmentação — menos msgs, mais resultado', status:'Alta' },
        { tarefa:'Explorar Outubro e Dezembro — melhores meses históricos', status:'Média' },
        { tarefa:'Testar aumento de ticket médio com curadoria de produtos premium', status:'Média' },
      ],
    },
  ],
};
