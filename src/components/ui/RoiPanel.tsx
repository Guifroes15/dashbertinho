import { StoreData } from '../../types';
import { calcRoi, formatBRL } from '../../utils';
import { TrendingUp, DollarSign, Wallet, Target, Info, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface RoiPanelProps {
  store: StoreData;
  fee: number;
}

export function RoiPanel({ store, fee }: RoiPanelProps) {
  const roiData = calcRoi(store, fee);

  return (
    <div className="space-y-6">
      {/* ── ALERTA DE DADOS ────────────────────────────────────────────── */}
      {!roiData.temVerba && (
        <div className="flex gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs leading-relaxed text-amber-200">
          <AlertCircle className="w-5 h-5 shrink-0 text-amber-400" />
          <div>
            <strong>Atenção:</strong> Esta loja não possui dados de investimento em mídia (verba) registrados. 
            O custo total está considerando apenas a taxa de gestão (Fee).
          </div>
        </div>
      )}

      {/* ── RESUMO GERAL ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Retorno Acumulado"
          value={formatBRL(roiData.roiTotal)}
          sub={`ROI: ${roiData.roiTotalPct.toFixed(1)}%`}
          icon={Target}
          trend={roiData.roiTotal >= 0 ? 'up' : 'down'}
        />
        <StatCard
          label="Vendas Aure"
          value={formatBRL(roiData.totalVendas)}
          sub={`${roiData.meses.length} meses analisados`}
          icon={TrendingUp}
        />
        <StatCard
          label="Custo Total"
          value={formatBRL(roiData.totalCusto)}
          sub={`Fee: ${formatBRL(roiData.totalFee)} + Mídia: ${formatBRL(roiData.totalVerba)}`}
          icon={DollarSign}
        />
        <StatCard
          label="Meses Lucrativos"
          value={`${roiData.mesesPositivos}`}
          sub={`de ${roiData.meses.length} meses`}
          icon={Wallet}
        />
      </div>

      {/* ── TABELA DE ROI MENSAL ────────────────────────────────────────── */}
      <div className="bg-brand-medium border border-brand-light rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">
              <th className="px-4 py-3 font-medium">Mês</th>
              <th className="px-4 py-3 font-medium text-right">Vendas</th>
              <th className="px-4 py-3 font-medium text-right">Custo Total</th>
              <th className="px-4 py-3 font-medium text-right">Resultado</th>
              <th className="px-4 py-3 font-medium text-right">ROI (%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {roiData.meses.map((m, idx) => (
              <tr key={idx} className="hover:bg-white/5 transition-colors group">
                <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{m.mesLabel}</td>
                <td className="px-4 py-3 text-right tabular-nums text-[var(--text-secondary)]">
                  {formatBRL(m.vendas)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors">
                   <span className="text-[10px] opacity-70">
                     ({formatBRL(m.fee)} + {formatBRL(m.verba)})
                   </span>
                   <span className="ml-2">{formatBRL(m.custoTotal)}</span>
                </td>
                <td className={`px-4 py-3 text-right font-medium tabular-nums ${m.positivo ? 'text-green-400' : 'text-rose-400'}`}>
                  {m.roi >= 0 ? '+' : ''}{formatBRL(m.roi)}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold ${m.positivo ? 'bg-green-500/15 text-green-400' : 'bg-rose-500/15 text-rose-400'}`}>
                    {m.roiPct.toFixed(0)}%
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── NOTA EXPLICATIVA ───────────────────────────────────────────── */}
      <div className="flex gap-3 p-4 bg-violet-500/10 border border-violet-500/20 rounded-lg text-xs leading-relaxed text-violet-200">
        <Info className="w-5 h-5 shrink-0 text-violet-400" />
        <div>
          O <strong>Custo Total</strong> é a soma da taxa mensal de gestão (FEE) de {formatBRL(fee)} + o investimento realizado em mídia (Verba) no mês correspondente. 
          O ROI é calculado subtraindo o custo total das vendas atribuídas ao canal.
        </div>
      </div>
    </div>
  );
}

// ── AUXILIAR ─────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, trend }: any) {
  return (
    <motion.div 
      whileHover={{ y: -2 }}
      className="bg-brand-medium border border-brand-light p-4 rounded-xl space-y-2 group"
    >
      <div className="flex justify-between items-start">
        <span className="text-xs text-[var(--text-secondary)] font-medium">{label}</span>
        <div className="p-2 bg-white/5 rounded-lg group-hover:bg-brand-light transition-colors">
          <Icon className="w-4 h-4 text-brand-accent" />
        </div>
      </div>
      <div className="flex flex-col">
        <span className={`text-xl font-bold ${trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-rose-400' : 'text-[var(--text-primary)]'}`}>
          {value}
        </span>
        <span className="text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-wider">{sub}</span>
      </div>
    </motion.div>
  );
}
