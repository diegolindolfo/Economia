import React from 'react';
import { TrendingUp, ArrowDownLeft, ArrowUpRight, ShieldCheck, Sparkles, Layers } from 'lucide-react';
import { Transaction } from '../types';
import { formatCurrency, formatDateBR } from '../lib/format';
import { CategoryChip } from './CategoryChip';

interface InvestmentsPanelProps {
  transactions: Transaction[];
  onOpenCategorySheet: (txn: Transaction) => void;
}

export const InvestmentsPanel: React.FC<InvestmentsPanelProps> = ({
  transactions,
  onOpenCategorySheet,
}) => {
  // Filter investment transactions
  const investmentTransactions = transactions.filter((t) => t.category === 'investimento');

  let totalApplied = 0; // Aplicações (outflows into RDB)
  let totalRedeemed = 0; // Resgates (inflows back)

  investmentTransactions.forEach((t) => {
    if (t.valor < 0) {
      totalApplied += Math.abs(t.valor);
    } else {
      totalRedeemed += t.valor;
    }
  });

  const netInvested = totalApplied - totalRedeemed;

  if (transactions.length === 0) return null;

  return (
    <div className="w-full bg-[#FBF9F2] rounded-2xl p-4 sm:p-5 border border-[#D6D0BC] shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#D6D0BC]/60">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#1F6672]/15 text-[#1F6672] flex items-center justify-center border border-[#1F6672]/30">
            <TrendingUp size={16} />
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-[#555C54] block">
              Patrimônio & Reservas
            </span>
            <h3 className="font-receipt-display text-base sm:text-lg font-bold text-[#1E241F] leading-tight">
              Investimentos (RDB / Caixinhas)
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1F6672]/10 text-[#1F6672] text-xs font-semibold border border-[#1F6672]/20">
          <ShieldCheck size={13} />
          <span>RDB 100% CDI</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 my-3.5">
        <div className="p-3 rounded-xl bg-[#EAE6D9]/50 border border-[#D6D0BC]/60">
          <div className="flex items-center justify-between text-xs text-[#63665C] mb-1">
            <span>Aplicações (Aportes)</span>
            <ArrowUpRight size={13} className="text-[#1F6672]" />
          </div>
          <div className="font-receipt-mono text-lg font-bold text-[#1F6672]">
            {formatCurrency(totalApplied)}
          </div>
          <span className="text-xs text-[#555C54]">Transferido para o RDB</span>
        </div>

        <div className="p-3 rounded-xl bg-[#EAE6D9]/50 border border-[#D6D0BC]/60">
          <div className="flex items-center justify-between text-xs text-[#63665C] mb-1">
            <span>Resgates</span>
            <ArrowDownLeft size={13} className="text-[#2E6B4F]" />
          </div>
          <div className="font-receipt-mono text-lg font-bold text-[#2E6B4F]">
            {formatCurrency(totalRedeemed)}
          </div>
          <span className="text-xs text-[#555C54]">Retornado para conta corrente</span>
        </div>

        <div className="p-3 rounded-xl bg-[#EAE6D9]/50 border border-[#D6D0BC]/60">
          <div className="flex items-center justify-between text-xs text-[#63665C] mb-1">
            <span>Aporte Líquido</span>
            <Layers size={13} className="text-[#1E241F]" />
          </div>
          <div className="font-receipt-mono text-lg font-bold text-[#1E241F]">
            {formatCurrency(netInvested, true)}
          </div>
          <span className="text-xs text-[#555C54]">Variação líquida de reserva</span>
        </div>
      </div>

      {/* Investment Transactions List */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-[#63665C] mb-2 flex items-center justify-between">
          <span>Movimentações de Investimento ({investmentTransactions.length})</span>
          <span className="text-xs text-[#555C54]">Auto-detectado por RDB/Investimento</span>
        </div>

        {investmentTransactions.length === 0 ? (
          <div className="py-5 text-center bg-[#EAE6D9]/30 rounded-xl border border-dashed border-[#D6D0BC] text-xs text-[#63665C]">
            Nenhuma aplicação ou resgate RDB identificado neste extrato.
          </div>
        ) : (
          <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
            {investmentTransactions.map((txn) => {
              const isRedemption = txn.valor > 0;
              return (
                <div
                  key={txn.id}
                  className="p-2.5 rounded-xl bg-[#EAE6D9]/40 hover:bg-[#EAE6D9] border border-[#D6D0BC]/60 transition-all flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <CategoryChip
                      category={txn.category}
                      source={txn.categorySource}
                      size="sm"
                      interactive
                      onClick={() => onOpenCategorySheet(txn)}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs sm:text-sm font-semibold text-[#1E241F] truncate">
                        {txn.desc}
                      </div>
                      <div className="text-xs text-[#555C54] font-mono">
                        {formatDateBR(txn.date)}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 text-right font-receipt-mono font-bold text-xs sm:text-sm">
                    <span className={isRedemption ? 'text-[#2E6B4F]' : 'text-[#1F6672]'}>
                      {isRedemption ? `+${formatCurrency(txn.valor)}` : `-${formatCurrency(Math.abs(txn.valor))}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
