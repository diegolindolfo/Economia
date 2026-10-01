import React from 'react';
import { ArrowDownLeft, ArrowUpRight, TrendingUp, Scale } from 'lucide-react';
import { Transaction } from '../types';
import { formatCurrency } from '../lib/format';

interface StatCarouselProps {
  transactions: Transaction[];
  selectedMonth: string; // 'all' or 'yyyy-mm'
}

export const StatCarousel: React.FC<StatCarouselProps> = ({
  transactions,
  selectedMonth,
}) => {
  // Filter by selected month if not 'all'
  const filtered = selectedMonth === 'all'
    ? transactions
    : transactions.filter((t) => t.date.startsWith(selectedMonth));

  let totalExpenses = 0;
  let totalIncomes = 0;
  let appliedInvestments = 0;
  let redeemedInvestments = 0;
  let expenseCount = 0;
  let incomeCount = 0;
  let investmentCount = 0;

  filtered.forEach((t) => {
    if (t.category === 'investimento') {
      if (t.valor < 0) {
        appliedInvestments += Math.abs(t.valor);
      } else {
        redeemedInvestments += t.valor;
      }
      investmentCount++;
    } else if (t.valor > 0) {
      totalIncomes += t.valor;
      incomeCount++;
    } else {
      totalExpenses += Math.abs(t.valor);
      expenseCount++;
    }
  });

  const netInvested = appliedInvestments - redeemedInvestments;
  const netMonth = totalIncomes - totalExpenses;

  const stats = [
    {
      id: 'gastos',
      title: 'Gastos',
      amount: totalExpenses,
      count: expenseCount,
      countLabel: 'despesas',
      icon: ArrowUpRight,
      color: 'text-[#AE3B2B]',
      bgColor: 'bg-[#AE3B2B]/10',
      borderColor: 'border-[#AE3B2B]/20',
    },
    {
      id: 'receitas',
      title: 'Receitas',
      amount: totalIncomes,
      count: incomeCount,
      countLabel: 'entradas',
      icon: ArrowDownLeft,
      color: 'text-[#2E6B4F]',
      bgColor: 'bg-[#2E6B4F]/10',
      borderColor: 'border-[#2E6B4F]/20',
    },
    {
      id: 'investido',
      title: netInvested >= 0 ? 'Aporte Líquido' : 'Uso de Reserva',
      amount: netInvested,
      count: investmentCount,
      countLabel: 'movimentações',
      icon: TrendingUp,
      color: netInvested >= 0 ? 'text-[#1F6672]' : 'text-[#B96A28]',
      bgColor: netInvested >= 0 ? 'bg-[#1F6672]/10' : 'bg-[#B96A28]/10',
      borderColor: netInvested >= 0 ? 'border-[#1F6672]/20' : 'border-[#B96A28]/20',
      showSign: true,
    },
    {
      id: 'balanco',
      title: 'Resultado do período',
      amount: netMonth,
      count: filtered.length,
      countLabel: 'movimentações',
      icon: Scale,
      color: netMonth >= 0 ? 'text-[#2E6B4F]' : 'text-[#AE3B2B]',
      bgColor: netMonth >= 0 ? 'bg-[#2E6B4F]/10' : 'bg-[#AE3B2B]/10',
      borderColor: netMonth >= 0 ? 'border-[#2E6B4F]/20' : 'border-[#AE3B2B]/20',
      showSign: true,
    },
  ];

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 gap-3 pt-1 lg:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="flex min-w-0 flex-col justify-between rounded-xl border border-[#D6D0BC] bg-[#FBF9F2] p-3 shadow-xs transition-colors hover:border-[#1E241F]/30 sm:p-4"
            >
              <div>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="min-w-0 text-xs font-semibold leading-4 text-[#555C54]">
                    {item.title}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${item.bgColor} ${item.color} border ${item.borderColor}`}
                  >
                    <Icon size={15} />
                  </div>
                </div>

                <div className={`whitespace-nowrap font-receipt-mono text-base font-bold tracking-tight tabular-nums sm:text-2xl ${item.color}`}>
                  {formatCurrency(item.amount, item.showSign)}
                </div>
              </div>

              <div className="mt-2 border-t border-[#D6D0BC]/40 pt-2 text-xs text-[#555C54]">
                <span className="font-mono font-medium">
                  {item.count} {item.countLabel}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
