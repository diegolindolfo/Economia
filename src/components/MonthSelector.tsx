import React from 'react';
import { Calendar } from 'lucide-react';
import { Transaction } from '../types';
import { formatShortMonth } from '../lib/format';

interface MonthSelectorProps {
  transactions: Transaction[];
  selectedMonth: string;
  onSelectMonth: (month: string) => void;
}

export const MonthSelector: React.FC<MonthSelectorProps> = ({
  transactions,
  selectedMonth,
  onSelectMonth,
}) => {
  // Extract all unique year-months from transactions
  const months: string[] = Array.from(
    new Set(transactions.map((t) => t.date.slice(0, 7)))
  ).filter((m): m is string => Boolean(m)).sort().reverse();

  if (months.length <= 1 && selectedMonth === 'all') {
    return null;
  }

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none py-1">
      <div className="flex items-center gap-1 text-xs text-[#63665C] font-semibold uppercase tracking-wider mr-1 shrink-0">
        <Calendar size={13} />
        <span>Mês:</span>
      </div>

      <button
        type="button"
        onClick={() => onSelectMonth('all')}
        className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer min-h-[32px] border ${
          selectedMonth === 'all'
            ? 'bg-[#1E241F] text-[#FBF9F2] border-[#1E241F] shadow-xs'
            : 'bg-[#FBF9F2] text-[#63665C] border-[#D6D0BC] hover:border-[#1E241F]/40'
        }`}
      >
        Todo o Extrato ({transactions.length})
      </button>

      {months.map((m) => {
        const count = transactions.filter((t) => t.date.startsWith(m)).length;
        const isSelected = selectedMonth === m;
        return (
          <button
            key={m}
            type="button"
            onClick={() => onSelectMonth(m)}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer min-h-[32px] border ${
              isSelected
                ? 'bg-[#1E241F] text-[#FBF9F2] border-[#1E241F] shadow-xs'
                : 'bg-[#FBF9F2] text-[#63665C] border-[#D6D0BC] hover:border-[#1E241F]/40'
            }`}
          >
            {formatShortMonth(m)} ({count})
          </button>
        );
      })}
    </div>
  );
};
