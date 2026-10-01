import React, { useMemo } from 'react';
import {
  TrendingUp,
  ReceiptText,
  PieChart,
  UploadCloud,
  ChevronRight,
  Sparkles,
  SlidersHorizontal,
  Wallet,
} from 'lucide-react';
import { Category, Settings, Transaction } from '../../types';
import { formatCurrency, formatDateBR, formatPercent } from '../../lib/format';
import { calculateAccountBalance } from '../../lib/finance/balance';
import { CATEGORIES } from '../../lib/categorization/categories';
import { MonthSelector } from '../MonthSelector';
import { StatCarousel } from '../StatCarousel';
import { DaySummary } from '../DaySummary';
import { CategoryChip, CategoryIcon } from '../CategoryChip';
import { TabType } from '../Navigation';

interface HomeViewProps {
  transactions: Transaction[];
  settings: Settings;
  selectedMonth: string;
  onSelectMonth: (month: string) => void;
  onSelectTab: (tab: TabType) => void;
  onOpenCategorySheet: (txn: Transaction) => void;
  onOpenImportModal: () => void;
  onOpenSettingsModal: () => void;
  onLoadSample: () => void;
  onSelectCategory?: (category: Category | 'all') => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  transactions,
  settings,
  selectedMonth,
  onSelectMonth,
  onSelectTab,
  onOpenCategorySheet,
  onOpenImportModal,
  onOpenSettingsModal,
  onLoadSample,
  onSelectCategory,
}) => {
  // Filter transactions by selected month
  const filteredTxns = useMemo(() => {
    return selectedMonth === 'all'
      ? transactions
      : transactions.filter((t) => t.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  // Aggregate monthly / period metrics
  const {
    totalIncomes,
    appliedInvestments,
    redeemedInvestments,
  } = useMemo(() => {
    let inc = 0;
    let applied = 0;
    let redeemed = 0;

    filteredTxns.forEach((t) => {
      if (t.category === 'investimento') {
        if (t.valor < 0) applied += Math.abs(t.valor);
        else redeemed += t.valor;
      } else if (t.valor > 0) {
        inc += t.valor;
      }
    });

    return {
      totalIncomes: inc,
      appliedInvestments: applied,
      redeemedInvestments: redeemed,
    };
  }, [filteredTxns]);

  const netInvested = appliedInvestments - redeemedInvestments;

  // Aggregate total accumulated investment reserves across entire history
  const totalAccumulatedReserves = useMemo(() => {
    let allApplied = 0;
    let allRedeemed = 0;
    transactions.forEach((t) => {
      if (t.category === 'investimento') {
        if (t.valor < 0) allApplied += Math.abs(t.valor);
        else allRedeemed += t.valor;
      }
    });
    return Math.max(0, allApplied - allRedeemed);
  }, [transactions]);

  const hasOpeningBalance = settings.openingBalance !== null && settings.openingBalance !== undefined;
  const displayBalance = calculateAccountBalance(transactions, settings);

  const totalConsolidatedWealth = displayBalance + totalAccumulatedReserves;

  // Real savings rate: net saved into investments relative to genuine income
  const savingsRate = totalIncomes > 0 ? (netInvested / totalIncomes) * 100 : 0;

  // Top expense categories breakdown for the period
  const topExpenseCategories = useMemo(() => {
    const totals: Record<string, number> = {};
    let totalExpenseSum = 0;

    filteredTxns.forEach((t) => {
      if (t.valor < 0 && t.category !== 'investimento') {
        const val = Math.abs(t.valor);
        totalExpenseSum += val;
        totals[t.category] = (totals[t.category] ?? 0) + val;
      }
    });

    return Object.entries(totals)
      .map(([cat, amount]) => ({
        category: cat as Category,
        amount,
        percentage: totalExpenseSum > 0 ? (amount / totalExpenseSum) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [filteredTxns]);

  // Recent 6 transactions for clean home preview
  const recentTransactions = useMemo(() => {
    return [...filteredTxns].slice(0, 6);
  }, [filteredTxns]);

  const handleCategoryClick = (cat: Category) => {
    if (onSelectCategory) {
      onSelectCategory(cat);
    }
    onSelectTab('categories');
  };

  return (
    transactions.length === 0 ? (
      <div className="mx-auto w-full max-w-6xl py-5 sm:py-8">
        <section
          aria-labelledby="welcome-title"
          className="relative isolate overflow-hidden rounded-3xl border border-[#D8D2C0] bg-[#FAF8F2] shadow-sm"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-28 -z-10 h-80 w-80 rounded-full bg-[#DDE9D8]/70 blur-3xl"
          />
          <div className="relative max-w-3xl p-6 sm:p-10 lg:p-14">
            <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E4EADF] text-[#2E6B4F]">
              <Wallet size={21} aria-hidden="true" />
            </span>
            <h1
              id="welcome-title"
              className="max-w-xl font-receipt-display text-3xl font-bold leading-tight tracking-tight text-[#141A15] sm:text-4xl lg:text-5xl"
            >
              Suas finanças, em ordem.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#555C54] sm:text-base">
              Importe um extrato para acompanhar saldo, gastos e investimentos.
            </p>

            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={onOpenImportModal}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#1E4D37] px-5 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#173D2C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E4D37]"
              >
                <UploadCloud size={17} aria-hidden="true" />
                Importar extrato
              </button>
              <button
                type="button"
                onClick={onLoadSample}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#CFC8B5] bg-white/70 px-5 py-3 text-sm font-semibold text-[#26372B] transition-colors hover:bg-[#F0EDE1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E4D37]"
              >
                <Sparkles size={16} aria-hidden="true" />
                Ver exemplo
              </button>
            </div>

            <p className="mt-4 text-xs text-[#636A60]">
              Seus dados ficam salvos neste navegador.
            </p>
          </div>
        </section>
      </div>
    ) : (
    <div className="space-y-4 sm:space-y-6">
      <MonthSelector
        transactions={transactions}
        selectedMonth={selectedMonth}
        onSelectMonth={onSelectMonth}
      />

      {/* 2. Master Financial Hero Card (Equilibrium of status, wealth, and cashflow) */}
      <div className="bg-[#141A15] text-[#FAF8F2] rounded-2xl p-5 sm:p-6 shadow-md border border-[#2B352D] relative overflow-hidden">
        {/* Subtle geometric backlight */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-radial from-[#253328]/35 to-transparent pointer-events-none -mr-24 -mt-24 rounded-full" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Main Balance & Consolidated Wealth Anchor */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-xs uppercase font-semibold tracking-wider text-[#B2BBAF]">
                {hasOpeningBalance ? 'Saldo atual' : 'Saldo estimado'}
              </span>
            </div>

            <div className="font-receipt-mono text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#FAF8F2] tabular-nums">
              {formatCurrency(displayBalance)}
            </div>

            {/* Secondary totals stay quiet beneath the main balance. */}
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-[#B2BBAF]">
              <span className="inline-flex items-center gap-1.5">
                <Wallet size={14} className="text-[#A9B4AA]" />
                <span>Patrimônio</span>
                <strong className="text-[#FAF8F2] font-mono tabular-nums">
                  {formatCurrency(totalConsolidatedWealth)}
                </strong>
              </span>

              {totalAccumulatedReserves > 0 && (
                <>
                  <span aria-hidden="true" className="text-[#3A483D]">·</span>
                  <span className="inline-flex items-center gap-1.5">
                    <TrendingUp size={13} className="text-[#71C4D1]" />
                    <span>Reservas</span>
                    <strong className="text-[#71C4D1] font-mono tabular-nums">
                      {formatCurrency(totalAccumulatedReserves)}
                    </strong>
                  </span>
                </>
              )}

            </div>
          </div>

        </div>
      </div>

      <section
        aria-label="Resumo e saldo inicial"
        className="flex items-center justify-between gap-3 rounded-2xl border border-[#D8D2C0] bg-[#FAF8F2] p-3 shadow-xs sm:p-4"
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {netInvested > 0 && totalIncomes > 0 && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#E4EADF] text-[#24563B] border border-[#BFCFBE] font-semibold">
                <span>Guardado</span>
                <strong className="font-mono tabular-nums">{formatPercent(savingsRate)}</strong>
              </div>
            )}
            {netInvested < 0 && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#F4E7D8] text-[#85501F] border border-[#E3C9A8] font-semibold">
                <span>Resgate</span>
                <strong className="font-mono tabular-nums">{formatCurrency(Math.abs(netInvested))}</strong>
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenSettingsModal}
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-[#CFC8B5] bg-white px-3 py-2 text-xs font-semibold text-[#26372B] transition-colors hover:bg-[#F0EDE1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E4D37]"
        >
          <SlidersHorizontal size={15} aria-hidden="true" />
          <span>{hasOpeningBalance ? 'Editar saldo' : 'Informar saldo'}</span>
        </button>
      </section>

      {/* 3. 4 Essential Macro Summary Cards (StatCarousel) */}
      <StatCarousel
        transactions={transactions}
        selectedMonth={selectedMonth}
      />

      {/* 4. Balanced Two-Column Section: Resumo Diário & Maiores Gastos por Categoria */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 items-start">
        {/* Left Column: Resumo do Dia (Interactive temporal timeline) */}
        <DaySummary
          transactions={transactions}
          onOpenCategorySheet={onOpenCategorySheet}
        />

        {/* Right Column: Maiores Gastos por Categoria no Período (Visual symmetry & insight) */}
        <div className="bg-[#FAF8F2] border border-[#D8D2C0] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div>
            {/* Header with quick link to full view */}
            <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-[#EAE4D2]">
              <div className="flex items-center gap-2">
                <PieChart size={17} className="text-[#141A15]" />
                <h3 className="font-receipt-display font-bold text-base text-[#141A15]">
                  Gastos por Categoria
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onSelectTab('categories')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#1F6672] hover:underline cursor-pointer"
              >
                <span>Ver gráfico completo</span>
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Category Bars Breakdown */}
            {topExpenseCategories.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#7A8277]">
                Sem gastos neste período.
              </div>
            ) : (
              <div className="space-y-3 my-2">
                {topExpenseCategories.map((item) => {
                  const info = CATEGORIES[item.category];
                  const label = info ? info.label : item.category;
                  const color = info ? info.color : '#555C54';

                  return (
                    <button
                      type="button"
                      key={item.category}
                      onClick={() => handleCategoryClick(item.category)}
                      className="group -mx-1.5 w-[calc(100%+0.75rem)] cursor-pointer rounded-lg p-1.5 text-left transition-colors hover:bg-[#F2ECE0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E4D37]"
                      title={`Clique para ver todos os gastos de ${label}`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `${color}18`, color }}
                          >
                            <CategoryIcon category={item.category} size={12} />
                          </div>
                          <span className="font-semibold text-[#141A15] group-hover:text-[#1F6672] transition-colors truncate">
                            {label}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-receipt-mono font-bold text-xs text-[#141A15] tabular-nums">
                            {formatCurrency(item.amount)}
                          </span>
                          <span className="font-mono text-xs text-[#636A60] w-9 text-right tabular-nums">
                            {item.percentage.toFixed(0)}%
                          </span>
                        </div>
                      </div>

                      {/* Smooth Proportion Bar */}
                      <div className="w-full bg-[#EAE4D2] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(100, Math.max(4, item.percentage))}%`,
                            backgroundColor: color,
                          }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* 5. Recent Transactions Preview Section (Direct, Clean & Linked to Statement) */}
      <div className="bg-[#FAF8F2] border border-[#D8D2C0] rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-[#EAE4D2]">
          <div className="flex items-center gap-2">
            <ReceiptText size={17} className="text-[#141A15]" />
            <h3 className="font-receipt-display font-bold text-base text-[#141A15]">
              Últimos Lançamentos
            </h3>
          </div>

          <button
            type="button"
            onClick={() => onSelectTab('statement')}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#141A15] hover:text-[#1F6672] transition-colors cursor-pointer bg-[#EDE8DC] hover:bg-[#E2DDCB] px-3 py-1.5 rounded-lg border border-[#D8D2C0]"
          >
            <span>Ver extrato</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#7A8277]">
            Nenhuma transação encontrada no período.
          </div>
        ) : (
          <div className="divide-y divide-[#EFECE0]">
            {recentTransactions.map((txn) => {
              const isIncome = txn.valor > 0;
              const isInvestment = txn.category === 'investimento';
              const title = txn.displayName || txn.merchantKey || txn.desc;
              const detail = txn.desc !== title ? txn.desc : null;

              return (
                <div
                  key={txn.id}
                  className="py-2.5 flex items-center justify-between gap-3 hover:bg-[#F3EFE4] px-2 rounded-lg transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs sm:text-sm text-[#141A15] truncate">
                        {title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#555C54] mt-0.5">
                      <span>{formatDateBR(txn.date)}</span>
                      {detail && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="truncate max-w-[240px]">{detail}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <CategoryChip
                      category={txn.category}
                      source={txn.categorySource}
                      onClick={() => onOpenCategorySheet(txn)}
                      showSource={false}
                    />

                    <div
                      className={`font-receipt-mono font-bold text-xs sm:text-sm text-right min-w-[85px] tabular-nums ${
                        isInvestment
                          ? 'text-[#B96A28]'
                          : isIncome
                          ? 'text-[#2E6B4F]'
                          : 'text-[#C84B31]'
                      }`}
                    >
                      {isIncome ? '+' : ''}
                      {formatCurrency(txn.valor)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
    )
  );
};
