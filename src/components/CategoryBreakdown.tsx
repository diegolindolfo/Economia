import React, { useMemo } from 'react';
import { PieChart, Filter, ChevronRight, Check } from 'lucide-react';
import { Category, Transaction } from '../types';
import { CATEGORIES, CATEGORY_LIST } from '../lib/categorization/categories';
import { formatCurrency, formatPercent } from '../lib/format';
import { CategoryIcon } from './CategoryChip';

interface CategoryBreakdownProps {
  transactions: Transaction[];
  selectedCategory: Category | 'all';
  onSelectCategory: (cat: Category | 'all') => void;
  selectedMonth: string;
}

export const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({
  transactions,
  selectedCategory,
  onSelectCategory,
  selectedMonth,
}) => {
  // Filter by selected month first
  const monthlyTransactions = useMemo(() => {
    return selectedMonth === 'all'
      ? transactions
      : transactions.filter((t) => t.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  // Aggregate expenses by category (excluding pure receitas, but can show all or expenses)
  const { categoryStats, totalExpenses } = useMemo(() => {
    const stats: Record<Category, { total: number; count: number }> = {
      moradia: { total: 0, count: 0 },
      educacao: { total: 0, count: 0 },
      alimentacao: { total: 0, count: 0 },
      compras: { total: 0, count: 0 },
      assinaturas: { total: 0, count: 0 },
      saude: { total: 0, count: 0 },
      investimento: { total: 0, count: 0 },
      transferencia: { total: 0, count: 0 },
      outros: { total: 0, count: 0 },
      receita: { total: 0, count: 0 },
    };

    let totalExp = 0;

    monthlyTransactions.forEach((t) => {
      if (t.category === 'receita') {
        stats.receita.total += t.valor;
        stats.receita.count++;
      } else {
        // Debits / Outflows
        const absVal = Math.abs(t.valor);
        stats[t.category].total += absVal;
        stats[t.category].count++;
        totalExp += absVal;
      }
    });

    return { categoryStats: stats, totalExpenses: totalExp };
  }, [monthlyTransactions]);

  // Sort categories by highest expense
  const sortedExpenseCategories = useMemo(() => {
    return CATEGORY_LIST.filter((c) => c.id !== 'receita')
      .map((cat) => {
        const data = categoryStats[cat.id];
        const percent = totalExpenses > 0 ? (data.total / totalExpenses) * 100 : 0;
        return {
          ...cat,
          total: data.total,
          count: data.count,
          percent,
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [categoryStats, totalExpenses]);

  if (transactions.length === 0) return null;

  return (
    <div className="w-full bg-[#FBF9F2] rounded-2xl p-4 sm:p-5 border border-[#D6D0BC] shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#D6D0BC]/60">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#EAE6D9] text-[#1E241F] flex items-center justify-center border border-[#D6D0BC]">
            <PieChart size={16} />
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#63665C] block">
              Distribuição
            </span>
            <h3 className="font-receipt-display text-base sm:text-lg font-bold text-[#1E241F] leading-tight">
              Gastos por Categoria
            </h3>
          </div>
        </div>

        {selectedCategory !== 'all' && (
          <button
            type="button"
            onClick={() => onSelectCategory('all')}
            className="text-xs font-semibold text-[#B96A28] hover:underline cursor-pointer flex items-center gap-1"
          >
            <Filter size={12} />
            <span>Limpar filtro</span>
          </button>
        )}
      </div>

      {/* Stacked Proportional Bar */}
      {totalExpenses > 0 && (
        <div className="mt-3.5 mb-4">
          <div className="w-full h-3 rounded-full overflow-hidden flex bg-[#EAE6D9] p-0.5 border border-[#D6D0BC]/80">
            {sortedExpenseCategories
              .filter((c) => c.percent > 0)
              .map((c) => (
                <div
                  key={c.id}
                  style={{
                    width: `${c.percent}%`,
                    backgroundColor: c.color,
                  }}
                  className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-300 hover:opacity-80"
                  title={`${c.label}: ${formatPercent(c.percent)} (${formatCurrency(c.total)})`}
                />
              ))}
          </div>
          <div className="flex justify-between items-center text-[11px] text-[#63665C] mt-1.5 font-mono">
            <span>Total de saídas analisadas:</span>
            <span className="font-bold text-[#1E241F]">{formatCurrency(totalExpenses)}</span>
          </div>
        </div>
      )}

      {/* Horizontal Category Progress Rows */}
      <div className="space-y-2">
        {sortedExpenseCategories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const hasSpending = cat.total > 0;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(isSelected ? 'all' : cat.id)}
              className={`w-full p-2.5 rounded-xl border text-left transition-all duration-150 cursor-pointer flex flex-col gap-1.5 ${
                isSelected
                  ? 'border-[#1E241F] bg-[#EAE6D9] shadow-xs'
                  : 'border-[#D6D0BC]/60 hover:border-[#1E241F]/30 hover:bg-[#F5F2E7]'
              } ${!hasSpending ? 'opacity-50' : ''}`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border"
                    style={{
                      backgroundColor: cat.bgColor,
                      color: cat.color,
                      borderColor: cat.borderColor,
                    }}
                  >
                    <CategoryIcon category={cat.id} size={14} />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-[#1E241F] truncate">
                    {cat.label}
                  </span>
                  <span className="text-[10px] text-[#63665C] font-mono">
                    ({cat.count} {cat.count === 1 ? 'item' : 'itens'})
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <div className="font-receipt-mono text-xs sm:text-sm font-bold text-[#1E241F]">
                      {formatCurrency(cat.total)}
                    </div>
                  </div>
                  <div className="w-10 text-right text-[11px] font-mono text-[#63665C]">
                    {formatPercent(cat.percent)}
                  </div>
                  <div className="w-4 flex justify-center text-[#63665C]">
                    {isSelected ? (
                      <Check size={14} className="text-[#1E241F]" />
                    ) : (
                      <ChevronRight size={14} className="opacity-40" />
                    )}
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 rounded-full bg-[#EAE6D9] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.max(cat.percent, cat.total > 0 ? 3 : 0)}%`,
                    backgroundColor: cat.color,
                  }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
