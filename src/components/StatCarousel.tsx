import React from 'react';
import { ArrowDownLeft, ArrowUpRight, TrendingUp, Wallet, Scale } from 'lucide-react';
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
  let totalInvestments = 0;
  let expenseCount = 0;
  let incomeCount = 0;
  let investmentCount = 0;

  filtered.forEach((t) => {
    if (t.category === 'investimento') {
      // Net investment movement
      totalInvestments += Math.abs(t.valor);
      investmentCount++;
    } else if (t.valor > 0) {
      totalIncomes += t.valor;
      incomeCount++;
    } else {
      totalExpenses += Math.abs(t.valor);
      expenseCount++;
    }
  });

  const netMonth = totalIncomes - totalExpenses;

  const stats = [
    {
      id: 'gastos',
      title: 'Gastos no Período',
      amount: totalExpenses,
      count: expenseCount,
      countLabel: 'despesas',
      icon: ArrowUpRight,
      color: 'text-[#AE3B2B]',
      bgColor: 'bg-[#AE3B2B]/10',
      borderColor: 'border-[#AE3B2B]/20',
      description: 'Débito, Pix e contas pagas',
    },
    {
      id: 'receitas',
      title: 'Receitas no Período',
      amount: totalIncomes,
      count: incomeCount,
      countLabel: 'entradas',
      icon: ArrowDownLeft,
      color: 'text-[#2E6B4F]',
      bgColor: 'bg-[#2E6B4F]/10',
      borderColor: 'border-[#2E6B4F]/20',
      description: 'Salário, depósitos e Pix recebidos',
    },
    {
      id: 'investido',
      title: 'Investido (RDB/Caixinhas)',
      amount: totalInvestments,
      count: investmentCount,
      countLabel: 'aportes/resgates',
      icon: TrendingUp,
      color: 'text-[#1F6672]',
      bgColor: 'bg-[#1F6672]/10',
      borderColor: 'border-[#1F6672]/20',
      description: 'Aplicações e reservas',
    },
    {
      id: 'balanco',
      title: 'Resultado Operacional',
      amount: netMonth,
      count: filtered.length,
      countLabel: 'movimentações',
      icon: Scale,
      color: netMonth >= 0 ? 'text-[#2E6B4F]' : 'text-[#AE3B2B]',
      bgColor: netMonth >= 0 ? 'bg-[#2E6B4F]/10' : 'bg-[#AE3B2B]/10',
      borderColor: netMonth >= 0 ? 'border-[#2E6B4F]/20' : 'border-[#AE3B2B]/20',
      description: netMonth >= 0 ? 'Superávit no período' : 'Déficit no período',
      showSign: true,
    },
  ];

  return (
    <div className="w-full">
      {/* Mobile scroll-snap container / Desktop 4-column grid */}
      <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3 overflow-x-auto pb-2 pt-1 px-1 snap-x snap-mandatory scrollbar-none sm:overflow-visible">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={`min-w-[240px] sm:min-w-0 flex-1 bg-[#FBF9F2] rounded-xl p-4 border border-[#D6D0BC] shadow-xs snap-center transition-all hover:border-[#1E241F]/30 flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#63665C]">
                    {item.title}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${item.bgColor} ${item.color} border ${item.borderColor}`}
                  >
                    <Icon size={15} />
                  </div>
                </div>

                <div className={`font-receipt-mono text-xl sm:text-2xl font-bold tracking-tight ${item.color}`}>
                  {formatCurrency(item.amount, item.showSign)}
                </div>
              </div>

              <div className="pt-2 mt-2 border-t border-[#D6D0BC]/40 flex items-center justify-between text-[11px] text-[#63665C]">
                <span>{item.description}</span>
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
