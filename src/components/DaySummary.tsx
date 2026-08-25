import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, ArrowDownLeft, ArrowUpRight, Clock } from 'lucide-react';
import { Category, Transaction } from '../types';
import { formatCurrency, getRelativeDayLabel } from '../lib/format';
import { CategoryChip } from './CategoryChip';

interface DaySummaryProps {
  transactions: Transaction[];
  onOpenCategorySheet: (transaction: Transaction) => void;
}

export const DaySummary: React.FC<DaySummaryProps> = ({
  transactions,
  onOpenCategorySheet,
}) => {
  // Extract all active unique dates from transactions sorted descending
  const activeDates = useMemo(() => {
    return Array.from(new Set(transactions.map((t) => t.date))).sort().reverse();
  }, [transactions]);

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return activeDates[0] || new Date().toISOString().slice(0, 10);
  });

  // Keep selectedDate in sync if transactions change
  React.useEffect(() => {
    if (activeDates.length > 0 && !activeDates.includes(selectedDate)) {
      setSelectedDate(activeDates[0]);
    }
  }, [activeDates, selectedDate]);

  const currentIndex = activeDates.indexOf(selectedDate);
  const hasNext = currentIndex > 0; // newer date
  const hasPrev = currentIndex < activeDates.length - 1; // older date

  const handlePrev = () => {
    if (hasPrev) setSelectedDate(activeDates[currentIndex + 1]);
  };

  const handleNext = () => {
    if (hasNext) setSelectedDate(activeDates[currentIndex - 1]);
  };

  // Transactions on the selected day
  const dayTransactions = useMemo(() => {
    return transactions.filter((t) => t.date === selectedDate);
  }, [transactions, selectedDate]);

  let dayIncomes = 0;
  let dayExpenses = 0;
  dayTransactions.forEach((t) => {
    if (t.valor > 0) dayIncomes += t.valor;
    else dayExpenses += Math.abs(t.valor);
  });
  const dayNet = dayIncomes - dayExpenses;

  if (transactions.length === 0) return null;

  return (
    <div className="w-full bg-[#FBF9F2] rounded-2xl p-4 sm:p-5 border border-[#D6D0BC] shadow-xs">
      {/* Header with date navigator */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#D6D0BC]/60">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#EAE6D9] text-[#1E241F] flex items-center justify-center border border-[#D6D0BC]">
            <CalendarDays size={16} />
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#63665C] block">
              Resumo do Dia
            </span>
            <h3 className="font-receipt-display text-base sm:text-lg font-bold text-[#1E241F] leading-tight">
              {getRelativeDayLabel(selectedDate)}
            </h3>
          </div>
        </div>

        {/* Navigation Arrows */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrev}
            disabled={!hasPrev}
            className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
              hasPrev
                ? 'bg-[#EAE6D9] hover:bg-[#D6D0BC] text-[#1E241F] border-[#D6D0BC] active:scale-95'
                : 'bg-[#FBF9F2] text-[#D6D0BC] border-[#D6D0BC]/40 opacity-50 cursor-not-allowed'
            }`}
            title="Dia anterior com lançamentos"
            aria-label="Dia anterior"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={!hasNext}
            className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
              hasNext
                ? 'bg-[#EAE6D9] hover:bg-[#D6D0BC] text-[#1E241F] border-[#D6D0BC] active:scale-95'
                : 'bg-[#FBF9F2] text-[#D6D0BC] border-[#D6D0BC]/40 opacity-50 cursor-not-allowed'
            }`}
            title="Próximo dia com lançamentos"
            aria-label="Próximo dia"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Quick horizontal active days selector */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-2.5 scrollbar-none border-b border-[#D6D0BC]/40">
        {activeDates.slice(0, 10).map((d) => {
          const isCurrent = d === selectedDate;
          const count = transactions.filter((t) => t.date === d).length;
          const dayNum = d.split('-')[2];
          const monthNum = d.split('-')[1];
          return (
            <button
              key={d}
              type="button"
              onClick={() => setSelectedDate(d)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer whitespace-nowrap border min-h-[30px] flex items-center gap-1.5 ${
                isCurrent
                  ? 'bg-[#1E241F] text-[#FBF9F2] border-[#1E241F] shadow-xs'
                  : 'bg-[#EAE6D9] text-[#63665C] border-[#D6D0BC] hover:border-[#1E241F]/40'
              }`}
            >
              <span>{dayNum}/{monthNum}</span>
              <span
                className={`text-[10px] px-1 rounded-full ${
                  isCurrent ? 'bg-[#38433A] text-white' : 'bg-[#D6D0BC]/70 text-[#1E241F]'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Daily Metrics */}
      <div className="grid grid-cols-3 gap-2 py-3 border-b border-[#D6D0BC]/60 text-center">
        <div className="p-2 rounded-xl bg-[#EAE6D9]/50 border border-[#D6D0BC]/60">
          <div className="flex items-center justify-center gap-1 text-[11px] text-[#AE3B2B] font-semibold">
            <ArrowUpRight size={13} />
            <span>Gastos</span>
          </div>
          <div className="font-receipt-mono text-sm sm:text-base font-bold text-[#AE3B2B] mt-0.5">
            {formatCurrency(dayExpenses)}
          </div>
        </div>

        <div className="p-2 rounded-xl bg-[#EAE6D9]/50 border border-[#D6D0BC]/60">
          <div className="flex items-center justify-center gap-1 text-[11px] text-[#2E6B4F] font-semibold">
            <ArrowDownLeft size={13} />
            <span>Entradas</span>
          </div>
          <div className="font-receipt-mono text-sm sm:text-base font-bold text-[#2E6B4F] mt-0.5">
            {formatCurrency(dayIncomes)}
          </div>
        </div>

        <div className="p-2 rounded-xl bg-[#EAE6D9]/50 border border-[#D6D0BC]/60">
          <div className="text-[11px] text-[#63665C] font-semibold">
            Líquido do Dia
          </div>
          <div
            className={`font-receipt-mono text-sm sm:text-base font-bold mt-0.5 ${
              dayNet >= 0 ? 'text-[#2E6B4F]' : 'text-[#AE3B2B]'
            }`}
          >
            {formatCurrency(dayNet, true)}
          </div>
        </div>
      </div>

      {/* Day Transactions List */}
      <div className="pt-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-[#63665C] mb-2 flex items-center justify-between">
          <span>Movimentações ({dayTransactions.length})</span>
          <span className="text-[11px] text-[#63665C] font-normal flex items-center gap-1">
            <Clock size={11} /> Toque para reclassificar
          </span>
        </div>

        {dayTransactions.length === 0 ? (
          <div className="py-4 text-center text-xs text-[#63665C]">
            Nenhuma movimentação nesta data.
          </div>
        ) : (
          <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
            {dayTransactions.map((txn) => {
              const isIncome = txn.valor > 0;
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
                        {txn.displayName}
                      </div>
                      <div className="text-[10px] text-[#63665C] truncate font-mono">
                        {txn.desc}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 text-right font-receipt-mono font-bold text-xs sm:text-sm">
                    <span className={isIncome ? 'text-[#2E6B4F]' : 'text-[#1E241F]'}>
                      {formatCurrency(txn.valor, isIncome)}
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
