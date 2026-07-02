import { StoreData, GroupData, SimuladorInput, SimuladorResult } from './types';

// ─── 1. SCORE DE SAÚDE ───────────────────────────────────────────────────────
export type HealthStatus = 'saudavel' | 'atencao' | 'critico';

export interface HealthScore {
  status: HealthStatus;
  label: string;
  color: string;
  bg: string;
  score: number;
  detalhes: { criterio: string; valor: string; pontos: number; maxPontos: number }[];
}

export function calcHealthScore(store: StoreData): HealthScore {
  const ultimos = [...store.historico].slice(-3);
  if (!ultimos.length)
    return { status:'critico', label:'Sem dados', color:'#ef4444', bg:'rgba(239,68,68,.1)', score:0, detalhes:[] };

  const convMedia = ultimos.reduce((a, m) => a + m.conversao, 0) / ultimos.length;
  const pontosConv = convMedia >= 10 ? 40 : convMedia >= 5 ? 28 : convMedia >= 2 ? 16 : 0;

  const comVendas = ultimos.filter(m => m.vendas > 0);
  let pontosCrescimento = 20;
  if (comVendas.length >= 2) {
    const delta = ((comVendas[comVendas.length-1].vendas - comVendas[0].vendas) / comVendas[0].vendas) * 100;
    pontosCrescimento = delta >= 10 ? 35 : delta >= 0 ? 20 : 0;
  }

  const comFat = ultimos.filter(m => m.faturamentoLoja > 0);
  const pctMedia = comFat.length ? comFat.reduce((a, m) => a + m.pctAureFat, 0) / comFat.length : 0;
  // Se não tem faturamento (Paralelas/Lupo), usa vendas como proxy
  const temFat = comFat.length > 0;
  let pontosPct = 0;
  if (temFat) {
    pontosPct = pctMedia >= 5 ? 25 : pctMedia >= 2 ? 15 : pctMedia >= 1 ? 8 : 0;
  } else {
    // Proxy: vendas crescendo = 25pts, estável = 15, caindo = 0
    pontosPct = pontosCrescimento >= 35 ? 25 : pontosCrescimento >= 20 ? 15 : 0;
  }

  const total = pontosConv + pontosCrescimento + pontosPct;
  const status: HealthStatus = total >= 60 ? 'saudavel' : total >= 30 ? 'atencao' : 'critico';
  const label = status === 'saudavel' ? 'Saudável' : status === 'atencao' ? 'Atenção' : 'Crítico';
  const color = status === 'saudavel' ? '#22c55e' : status === 'atencao' ? '#f59e0b' : '#ef4444';
  const bg    = status === 'saudavel' ? 'rgba(34,197,94,.1)' : status === 'atencao' ? 'rgba(245,158,11,.1)' : 'rgba(239,68,68,.1)';

  const crescDelta = comVendas.length >= 2
    ? `${(((comVendas[comVendas.length-1].vendas - comVendas[0].vendas) / comVendas[0].vendas)*100).toFixed(0)}%`
    : 'N/A';

  return {
    status, label, color, bg, score: total,
    detalhes: [
      { criterio:'Conversão média',    valor:`${convMedia.toFixed(1)}%`, pontos:pontosConv,        maxPontos:40 },
      { criterio:'Crescimento vendas', valor:crescDelta,                  pontos:pontosCrescimento, maxPontos:35 },
      { criterio:temFat ? '% Aure/Fat.' : 'Tendência vendas', valor:temFat ? `${pctMedia.toFixed(1)}%` : crescDelta, pontos:pontosPct, maxPontos:25 },
    ],
  };
}

// ─── 2. PROJEÇÃO ─────────────────────────────────────────────────────────────
export interface Projecao {
  valor: number;
  tendencia: 'alta' | 'baixa' | 'estavel';
  variacao: number;
  baseadoEm: number;
  label: string;
}

export function calcProjecao(store: StoreData): Projecao {
  const comVendas = store.historico.filter(m => m.vendas > 0).slice(-3);
  if (!comVendas.length)
    return { valor:0, tendencia:'estavel', variacao:0, baseadoEm:0, label:'Próx. mês' };

  const pesos = [1, 2, 3].slice(-comVendas.length);
  const somaPesos = pesos.reduce((a, p) => a + p, 0);
  const mediaSimples = comVendas.reduce((a, m) => a + m.vendas, 0) / comVendas.length;
  const mediaPonderada = comVendas.reduce((acc, m, i) => acc + m.vendas * pesos[i], 0) / somaPesos;
  const variacao = ((mediaPonderada - mediaSimples) / mediaSimples) * 100;
  const tendencia: 'alta' | 'baixa' | 'estavel' = variacao > 5 ? 'alta' : variacao < -5 ? 'baixa' : 'estavel';

  const ult = store.historico[store.historico.length - 1].chave;
  const [ano, mes] = ult.split('-').map(Number);
  const proxMes = mes === 12 ? 1 : mes + 1;
  const proxAno = mes === 12 ? ano + 1 : ano;
  const nomes = ['','Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

  return {
    valor: Math.round(mediaPonderada),
    tendencia, variacao,
    baseadoEm: comVendas.length,
    label: `${nomes[proxMes]}/${String(proxAno).slice(2)}`,
  };
}

// ─── 3. ROI ──────────────────────────────────────────────────────────────────
export interface RoiMesData {
  mesLabel: string;
  vendas: number;
  fee: number;
  verba: number;
  custoTotal: number;
  roi: number;
  roiPct: number;
  positivo: boolean;
}

export interface RoiSummary {
  meses: RoiMesData[];
  totalVendas: number;
  totalFee: number;
  totalVerba: number;
  totalCusto: number;
  roiTotal: number;
  roiTotalPct: number;
  mesesPositivos: number;
  mesesNegativos: number;
  status: 'positivo' | 'negativo' | 'neutro';
  temVerba: boolean;  // false = Lupo/Paralelas sem dados de verba
}

export function calcRoi(store: StoreData, fee: number): RoiSummary {
  const temVerba = store.historico.some(m => m.verba > 0);
  const meses: RoiMesData[] = store.historico.map(m => {
    const custoTotal = fee + m.verba;
    const roi = m.vendas - custoTotal;
    const roiPct = custoTotal > 0 ? ((m.vendas / custoTotal) - 1) * 100 : 0;
    return { mesLabel:m.mes, vendas:m.vendas, fee, verba:m.verba, custoTotal, roi, roiPct, positivo:roi >= 0 };
  });

  const totalVendas  = meses.reduce((a, m) => a + m.vendas, 0);
  const totalFee     = fee * meses.length;
  const totalVerba   = meses.reduce((a, m) => a + m.verba, 0);
  const totalCusto   = totalFee + totalVerba;
  const roiTotal     = totalVendas - totalCusto;
  const roiTotalPct  = totalCusto > 0 ? ((totalVendas / totalCusto) - 1) * 100 : 0;
  const mesesPositivos = meses.filter(m => m.positivo).length;

  return {
    meses, totalVendas, totalFee, totalVerba, totalCusto,
    roiTotal, roiTotalPct,
    mesesPositivos, mesesNegativos: meses.length - mesesPositivos,
    status: roiTotal > 0 ? 'positivo' : roiTotal < 0 ? 'negativo' : 'neutro',
    temVerba,
  };
}

// ─── 4. RANKING ──────────────────────────────────────────────────────────────
export interface RankingItem {
  storeId: string;
  storeName: string;
  color: string;
  mensagens: number;
  conversao: number;
  vendas: number;
  eficiencia: number;
  quadrante: 'eficiente' | 'volume' | 'potencial' | 'revisar' | 'sem-dados';
}

function mediana(arr: number[]): number {
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 !== 0 ? s[m] : (s[m-1] + s[m]) / 2;
}

export function calcRanking(stores: StoreData[]): RankingItem[] {
  const items = stores.map(store => {
    const comDados = store.historico.filter(m => m.mensagens > 0);
    const ultimo = comDados[comDados.length - 1];
    // Lojas sem dados de mensagens (Lupo)
    if (!ultimo) {
      const comVendas = store.historico.filter(m => m.vendas > 0);
      const ult = comVendas[comVendas.length - 1];
      return {
        storeId: store.id, storeName: store.name, color: store.color,
        mensagens: 0, conversao: 0, vendas: ult?.vendas ?? 0, eficiencia: 0,
        semDados: true,
      };
    }
    return {
      storeId: store.id, storeName: store.name, color: store.color,
      mensagens: ultimo.mensagens, conversao: ultimo.conversao, vendas: ultimo.vendas,
      eficiencia: ultimo.mensagens > 0 ? ultimo.vendas / ultimo.mensagens : 0,
      semDados: false,
    };
  });

  const comDados = items.filter(i => !i.semDados);
  const medMsg  = comDados.length ? mediana(comDados.map(i => i.mensagens)) : 0;
  const medConv = comDados.length ? mediana(comDados.map(i => i.conversao)) : 0;

  return items.map(item => ({
    storeId: item.storeId, storeName: item.storeName, color: item.color,
    mensagens: item.mensagens, conversao: item.conversao, vendas: item.vendas, eficiencia: item.eficiencia,
    quadrante: item.semDados ? 'sem-dados' :
      item.mensagens <= medMsg && item.conversao >= medConv ? 'eficiente' :
      item.mensagens >  medMsg && item.conversao >= medConv ? 'volume'    :
      item.mensagens <= medMsg && item.conversao <  medConv ? 'potencial' :
      'revisar',
  }) as RankingItem).sort((a, b) => b.eficiencia - a.eficiencia);
}

// ─── 5. SIMULADOR DE INVESTIMENTO ────────────────────────────────────────────
export function calcSimulador(
  store: StoreData,
  fee: number,
  input: SimuladorInput
): SimuladorResult {
  const { verbaPlanning, mensagensPlanning } = input;
  const custoTotal = fee + verbaPlanning;

  const comVendas = store.historico.filter(m => m.vendas > 0);
  const mesesUsados = Math.min(comVendas.length, 6); // até 6 meses
  const recentes = comVendas.slice(-mesesUsados);

  // Detectar método
  const temConvETicket = recentes.some(m => m.conversao > 0 && m.ticketMedio > 0);
  const temMsgs = recentes.some(m => m.mensagens > 0);

  let base = 0;
  let metodo: SimuladorResult['metodo'] = 'media-historica';

  if (temConvETicket && mensagensPlanning > 0) {
    // Método 1
    const convMedia = recentes.filter(m => m.conversao > 0).reduce((a, m) => a + m.conversao, 0)
      / recentes.filter(m => m.conversao > 0).length;
    const ticketMedio = recentes.filter(m => m.ticketMedio > 0).reduce((a, m) => a + m.ticketMedio, 0)
      / recentes.filter(m => m.ticketMedio > 0).length;
    base = mensagensPlanning * (convMedia / 100) * ticketMedio;
    metodo = 'conv+ticket';

  } else if (temMsgs && mensagensPlanning > 0) {
    // Método 2
    const rPerMsg = recentes.filter(m => m.mensagens > 0).reduce((a, m) => a + m.vendas / m.mensagens, 0)
      / recentes.filter(m => m.mensagens > 0).length;
    base = mensagensPlanning * rPerMsg;
    metodo = 'r-por-msg';

  } else {
    // Método 3
    const pesos = [1, 2, 3, 4, 5, 6].slice(-recentes.length);
    const somaPesos = pesos.reduce((a, p) => a + p, 0);
    base = recentes.reduce((acc, m, i) => acc + m.vendas * pesos[i], 0) / somaPesos;
    metodo = 'media-historica';
  }

  const pessimista = base * 0.7;
  const otimista   = base * 1.3;

  // Médias históricas para exibição
  const convMediaHist = recentes.filter(m => m.conversao > 0).length
    ? recentes.filter(m => m.conversao > 0).reduce((a, m) => a + m.conversao, 0) / recentes.filter(m => m.conversao > 0).length
    : 0;
  const ticketMedioHist = recentes.filter(m => m.ticketMedio > 0).length
    ? recentes.filter(m => m.ticketMedio > 0).reduce((a, m) => a + m.ticketMedio, 0) / recentes.filter(m => m.ticketMedio > 0).length
    : 0;
  const rPerMsgHist = recentes.filter(m => m.mensagens > 0).length
    ? recentes.filter(m => m.mensagens > 0).reduce((a, m) => a + m.vendas / m.mensagens, 0) / recentes.filter(m => m.mensagens > 0).length
    : 0;

  return {
    pessimista, base, otimista,
    custoTotal,
    roiPessimista: pessimista - custoTotal,
    roiBase:       base       - custoTotal,
    roiOtimista:   otimista   - custoTotal,
    convMediaHist, ticketMedioHist, rPerMsgHist,
    mesesUsados,
    metodo,
  };
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
export const formatBRL = (v: number) =>
  v.toLocaleString('pt-BR', { style:'currency', currency:'BRL' });

export const formatPct = (v: number) => `${v.toFixed(1)}%`;

export const ultimoMes = (store: StoreData) => {
  if (!store.historico || store.historico.length === 0) {
    return { 
      chave: '', mes: '', vendas: 0, faturamentoLoja: 0, 
      investimentoAure: 0, verba: 0, mensagens: 0, 
      conversao: 0, ticketMedio: 0, pctAureFat: 0 
    };
  }
  return [...store.historico].reverse().find(m => m.vendas > 0) ?? store.historico[store.historico.length - 1];
};

export const totalVendas = (store: StoreData) =>
  store.historico.reduce((a, m) => a + m.vendas, 0);
