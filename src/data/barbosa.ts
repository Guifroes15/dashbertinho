// ─── GRUPO BARBOSA ───────────────────────────────────────────────────────────
// Fee: R$ 1.500/loja/mês
// Período: Janeiro – Abril 2026
// Março: mês sem disparos em todas as lojas (verba = 0, vendas = 0)

import { GroupData } from '../types';

export const BARBOSA: GroupData = {
  id: 'barbosa',
  name: 'Grupo Barbosa',
  color: '#0ea5e9',
  fee: 1500,
  stores: [

    // ── BARBOSA CALÇADOS ─────────────────────────────────────────────────
    {
      id: 'barbosa-calcados',
      name: 'Barbosa Calçados',
      color: '#0ea5e9',
      historico: [
        { mes:'Jan/26', chave:'2026-01', vendas:13012.80, faturamentoLoja:290887.35, conversao:31.01, mensagens:129, qtdVendas:40, ticketMedio:325.32, pctAureFat:4.47, verba:743.73  },
        { mes:'Fev/26', chave:'2026-02', vendas:4984.20,  faturamentoLoja:351789.06, conversao:9.42,  mensagens:138, qtdVendas:13, ticketMedio:383.40, pctAureFat:1.42, verba:1002.83 },
        { mes:'Mar/26', chave:'2026-03', vendas:0,        faturamentoLoja:0,         conversao:0,     mensagens:0,   qtdVendas:0,  ticketMedio:0,      pctAureFat:0,    verba:0       },
        { mes:'Abr/26', chave:'2026-04', vendas:8587.86,  faturamentoLoja:287394.59, conversao:27.78, mensagens:90,  qtdVendas:25, ticketMedio:343.51, pctAureFat:2.99, verba:813.75  },
      ],
      planos: [
        { tarefa:'31% de conversão em Janeiro — entender o que funcionou e replicar', status:'Alta' },
        { tarefa:'Retomar disparos em Março — mês parado sem resultado', status:'Alta' },
        { tarefa:'Manter cadência — Barbosa é a loja mais forte do grupo', status:'Alta' },
        { tarefa:'Testar aumento de volume: base responde bem a mais mensagens', status:'Média' },
      ],
    },

    // ── B 201 (CENTRO IPA) ────────────────────────────────────────────────
    {
      id: 'b201',
      name: 'B 201',
      color: '#0284c7',
      historico: [
        { mes:'Jan/26', chave:'2026-01', vendas:9022.70, faturamentoLoja:311028.75, conversao:10.12, mensagens:247, qtdVendas:25, ticketMedio:360.91, pctAureFat:2.90, verba:682.20  },
        { mes:'Fev/26', chave:'2026-02', vendas:5289.40, faturamentoLoja:296517.55, conversao:5.10,  mensagens:314, qtdVendas:16, ticketMedio:330.59, pctAureFat:1.78, verba:1007.00 },
        { mes:'Mar/26', chave:'2026-03', vendas:0,       faturamentoLoja:0,         conversao:0,     mensagens:0,   qtdVendas:0,  ticketMedio:0,      pctAureFat:0,    verba:0       },
        { mes:'Abr/26', chave:'2026-04', vendas:4578.90, faturamentoLoja:231227.00, conversao:2.59,  mensagens:309, qtdVendas:8,  ticketMedio:572.36, pctAureFat:1.98, verba:1528.71 },
      ],
      planos: [
        { tarefa:'Conversão caindo (10% → 5% → 2.59%) — revisar segmentação e criativos', status:'Alta' },
        { tarefa:'Retomar disparos em Março — mês parado', status:'Alta' },
        { tarefa:'Ticket médio crescendo (R$360 → R$572) — focar em produtos de maior valor', status:'Média' },
        { tarefa:'Reduzir volume e melhorar qualidade das mensagens', status:'Média' },
      ],
    },

    // ── SIRIGAITA CALÇADOS ────────────────────────────────────────────────
    {
      id: 'sirigaita',
      name: 'Sirigaita',
      color: '#0369a1',
      historico: [
        { mes:'Jan/26', chave:'2026-01', vendas:5338.50, faturamentoLoja:175747.46, conversao:10.81, mensagens:296, qtdVendas:32, ticketMedio:166.83, pctAureFat:3.04, verba:873.25 },
        { mes:'Fev/26', chave:'2026-02', vendas:3775.90, faturamentoLoja:96505.30,  conversao:7.87,  mensagens:267, qtdVendas:21, ticketMedio:179.80, pctAureFat:3.91, verba:829.39 },
        { mes:'Mar/26', chave:'2026-03', vendas:0,       faturamentoLoja:0,         conversao:0,     mensagens:0,   qtdVendas:0,  ticketMedio:0,      pctAureFat:0,    verba:0      },
        { mes:'Abr/26', chave:'2026-04', vendas:3868.90, faturamentoLoja:107767.90, conversao:6.86,  mensagens:175, qtdVendas:12, ticketMedio:322.41, pctAureFat:3.59, verba:950.19 },
      ],
      planos: [
        { tarefa:'Ticket médio crescendo bem (R$166 → R$322) — explorar produtos premium', status:'Alta' },
        { tarefa:'Retomar disparos em Março — mês parado', status:'Alta' },
        { tarefa:'Volume alto mas conversão caindo — testar menos msgs com mais qualidade', status:'Média' },
        { tarefa:'Replicar estratégia de Janeiro (melhor mês)', status:'Média' },
      ],
    },

    // ── ZOOM CALÇADOS ─────────────────────────────────────────────────────
    {
      id: 'zoom',
      name: 'Zoom',
      color: '#38bdf8',
      historico: [
        { mes:'Jan/26', chave:'2026-01', vendas:6145.20, faturamentoLoja:73702.40, conversao:12.62, mensagens:206, qtdVendas:26, ticketMedio:236.35, pctAureFat:8.34,  verba:898.16 },
        { mes:'Fev/26', chave:'2026-02', vendas:4018.40, faturamentoLoja:38850.10, conversao:11.23, mensagens:187, qtdVendas:21, ticketMedio:191.35, pctAureFat:10.34, verba:853.08 },
        { mes:'Mar/26', chave:'2026-03', vendas:0,       faturamentoLoja:0,        conversao:0,     mensagens:0,   qtdVendas:0,  ticketMedio:0,      pctAureFat:0,     verba:0      },
        { mes:'Abr/26', chave:'2026-04', vendas:2502.30, faturamentoLoja:51421.32, conversao:6.90,  mensagens:145, qtdVendas:10, ticketMedio:250.23, pctAureFat:4.87,  verba:860.88 },
      ],
      planos: [
        { tarefa:'% Aure/Fat. alto (8-10%) — operação gerando resultado relevante para a loja', status:'Sucesso' },
        { tarefa:'Conversão caindo (12% → 11% → 6.9%) — revisar estratégia de Abril', status:'Alta' },
        { tarefa:'Retomar disparos em Março — mês parado', status:'Alta' },
        { tarefa:'Aumentar volume com qualidade — base responde bem', status:'Média' },
      ],
    },

    // ── AREZZO GV ─────────────────────────────────────────────────────────
    {
      id: 'arezzo',
      name: 'Arezzo',
      color: '#7dd3fc',
      historico: [
        { mes:'Jan/26', chave:'2026-01', vendas:4796.25, faturamentoLoja:177745.78, conversao:5.19, mensagens:231, qtdVendas:12, ticketMedio:399.69, pctAureFat:2.70,  verba:911.99  },
        { mes:'Fev/26', chave:'2026-02', vendas:0,       faturamentoLoja:0,         conversao:0,    mensagens:0,   qtdVendas:0,  ticketMedio:0,      pctAureFat:0,     verba:0       },
        { mes:'Mar/26', chave:'2026-03', vendas:0,       faturamentoLoja:5917.86,   conversao:0,    mensagens:179, qtdVendas:0,  ticketMedio:0,      pctAureFat:0,     verba:1035.07 },
        { mes:'Abr/26', chave:'2026-04', vendas:799.90,  faturamentoLoja:7045.47,   conversao:0.80, mensagens:125, qtdVendas:1,  ticketMedio:799.90, pctAureFat:11.35, verba:876.74  },
      ],
      planos: [
        { tarefa:'Resultado muito baixo — ticket alto (R$799) mas conversão quase zero', status:'Alta' },
        { tarefa:'Revisar segmentação — público-alvo pode não estar sendo atingido', status:'Alta' },
        { tarefa:'Fevereiro sem disparos — garantir continuidade da operação', status:'Alta' },
        { tarefa:'Testar criativos diferentes — produto premium exige abordagem específica', status:'Média' },
      ],
    },

    // ── FLAGS CALÇADOS ────────────────────────────────────────────────────
    {
      id: 'flags',
      name: 'Flags',
      color: '#bae6fd',
      historico: [
        { mes:'Jan/26', chave:'2026-01', vendas:546.70,  faturamentoLoja:120830.50, conversao:3.28,  mensagens:61,  qtdVendas:2,  ticketMedio:273.35, pctAureFat:0.45, verba:989.15  },
        { mes:'Fev/26', chave:'2026-02', vendas:9001.60, faturamentoLoja:113424.35, conversao:14.17, mensagens:120, qtdVendas:17, ticketMedio:529.51, pctAureFat:7.94, verba:995.83  },
        { mes:'Mar/26', chave:'2026-03', vendas:0,       faturamentoLoja:0,         conversao:0,     mensagens:0,   qtdVendas:0,  ticketMedio:0,      pctAureFat:0,    verba:0       },
        { mes:'Abr/26', chave:'2026-04', vendas:6924.50, faturamentoLoja:105317.20, conversao:7.03,  mensagens:128, qtdVendas:9,  ticketMedio:769.39, pctAureFat:6.57, verba:1473.22 },
      ],
      planos: [
        { tarefa:'Fevereiro explosivo (14% conv, R$9k) — entender o que causou e replicar', status:'Alta' },
        { tarefa:'Retomar disparos em Março — mês parado', status:'Alta' },
        { tarefa:'Ticket médio alto (R$529-769) — público qualificado, manter segmentação', status:'Alta' },
        { tarefa:'Janeiro fraco (R$546) — analisar diferença de abordagem vs Fevereiro', status:'Média' },
      ],
    },

  ],
};
