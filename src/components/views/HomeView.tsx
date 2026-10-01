import React, { useMemo } from 'react';
import {
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  ReceiptText,
  PieChart,
  UploadCloud,
  ChevronRight,
  Sparkles,
  SlidersHorizontal,
  Calendar,
  Wallet,
  ArrowRight,
} from 'lucide-react';
import { Category, Settings, Transaction } from '../../types';
import { formatCurrency, formatDateBR, formatPercent } from '../../lib/format';
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
  onOpenFocusMode: () => void;
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
  onOpenFocusMode,
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
    totalNet,
    totalIncomes,
    totalExpenses,
    appliedInvestments,
    redeemedInvestments,
  } = useMemo(() => {
    let net = 0;
    let inc = 0;
    let exp = 0;
    let applied = 0;
    let redeemed = 0;

    filteredTxns.forEach((t) => {
      net += t.valor;
      if (t.category === 'investimento') {
        if (t.valor < 0) applied += Math.abs(t.valor);
        else redeemed += t.valor;
      } else if (t.valor > 0) {
        inc += t.valor;
      } else {
        exp += Math.abs(t.valor);
      }
    });

    return {
      totalNet: net,
      totalIncomes: inc,
      totalExpenses: exp,
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

  const hasOpeningBalance =
    settings.openingBalance !== null && settings.openingBalance !== undefined;
  const displayBalance = hasOpeningBalance
    ? (settings.openingBalance || 0) + totalNet
    : totalNet;

  const totalConsolidatedWealth = displayBalance + totalAccumulatedReserves;

  // Real savings rate: net saved into investments relative to genuine income
  const savingsRate = totalIncomes > 0 ? (netInvested / totalIncomes) * 100 : 0;

  // Top expense categories breakdown for the period
  const topExpenseCategories = useMemo(() => {
    const totals: Record<string, { amount: number; count: number }> = {};
    let totalExpenseSum = 0;

    filteredTxns.forEach((t) => {
      if (t.valor < 0 && t.category !== 'investimento') {
        const val = Math.abs(t.valor);
        totalExpenseSum += val;
        if (!totals[t.category]) {
          totals[t.category] = { amount: 0, count: 0 };
        }
        totals[t.category].amount += val;
        totals[t.category].count += 1;
      }
    });

    return Object.entries(totals)
      .map(([cat, data]) => ({
        category: cat as Category,
        amount: data.amount,
        count: data.count,
        percentage: totalExpenseSum > 0 ? (data.amount / totalExpenseSum) * 100 : 0,
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
    <div className="space-y-4 sm:space-y-6">
      {/* 1. Month Reference & Temporal Filter Bar (Header contextual clarity) */}
      <div className="bg-[#FAF8F2] border border-[#D8D2C0] rounded-xl px-3.5 py-2 sm:px-4 sm:py-2.5 flex flex-wrap items-center justify-between gap-2 shadow-2xs">
        <div className="flex-1 min-w-[280px]">
          <MonthSelector
            transactions={transactions}
            selectedMonth={selectedMonth}
            onSelectMonth={onSelectMonth}
          />
        </div>

        <div className="hidden sm:flex items-center gap-3 text-xs text-[#555C54]">
          <span>
            {filteredTxns.length}{' '}
            {filteredTxns.length === 1 ? 'lançamento no período' : 'lançamentos no período'}
          </span>
          {transactions.length === 0 && (
            <button
              type="button"
              onClick={onLoadSample}
              className="inline-flex items-center gap-1 text-[#B96A28] font-semibold hover:underline cursor-pointer"
            >
              <Sparkles size={13} />
              <span>Carregar Exemplo</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Master Financial Hero Card (Equilibrium of status, wealth, and cashflow) */}
      <div className="bg-[#141A15] text-[#FAF8F2] rounded-2xl p-5 sm:p-6 shadow-md border border-[#2B352D] relative overflow-hidden">
        {/* Subtle geometric backlight */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-radial from-[#253328]/35 to-transparent pointer-events-none -mr-24 -mt-24 rounded-full" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Main Balance & Consolidated Wealth Anchor */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-xs uppercase font-semibold tracking-wider text-[#A39E8E]">
                {hasOpeningBalance ? 'Saldo em Conta Corrente' : 'Movimentação Líquida do Período'}
              </span>
              <span
                className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded ${
                  hasOpeningBalance
                    ? 'bg-[#2E6B4F]/40 text-[#A7D7BC] border border-[#2E6B4F]/50'
                    : 'bg-[#28322A] text-[#C9C4B5] border border-[#3A483D]'
                }`}
              >
                {hasOpeningBalance ? 'Sincronizado' : 'Estimado do Extrato'}
              </span>
            </div>

            <div className="font-receipt-mono text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#FAF8F2] tabular-nums">
              {formatCurrency(displayBalance)}
            </div>

            {/* Clean Unboxed Metadata Strip (Zero-Pill Discipline) */}
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-[#A39E8E]">
              <span className="inline-flex items-center gap-1.5">
                <Wallet size={13} className="text-[#8E9B90]" />
                <span>Patrimônio Total:</span>
                <strong className="text-[#FAF8F2] font-mono tabular-nums">
                  {formatCurrency(totalConsolidatedWealth)}
                </strong>
              </span>

              {totalAccumulatedReserves > 0 && (
                <>
                  <span aria-hidden="true" className="text-[#3A483D]">·</span>
                  <span className="inline-flex items-center gap-1.5">
                    <TrendingUp size={13} className="text-[#71C4D1]" />
                    <span>Em Caixinhas / RDB:</span>
                    <strong className="text-[#71C4D1] font-mono tabular-nums">
                      {formatCurrency(totalAccumulatedReserves)}
                    </strong>
                  </span>
                </>
              )}

              <span aria-hidden="true" className="text-[#3A483D]">·</span>
              <span className="text-[#8E9B90]">
                {selectedMonth === 'all'
                  ? 'Todo o histórico'
                  : `Mês ${selectedMonth.split('-')[1]}/${selectedMonth.split('-')[0]}`}
              </span>
            </div>
          </div>

          {/* Quick Flow Pulse Ledger (3 Balanced Columns) */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 w-full lg:w-auto lg:min-w-[420px] pt-3 lg:pt-0 border-t lg:border-t-0 border-[#263128]">
            {/* Real Incomes */}
            <div className="bg-[#1C241E] p-3 rounded-xl border border-[#2B372D] flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-[#48BB78] font-semibold mb-1">
                <span className="flex items-center gap-1">
                  <ArrowDownLeft size={13} />
                  <span>Receitas</span>
                </span>
                <span className="text-[10px] text-[#718073]">Reais</span>
              </div>
              <div className="font-receipt-mono text-sm sm:text-base font-bold text-[#FAF8F2] tabular-nums">
                +{formatCurrency(totalIncomes)}
              </div>
              <span className="text-[10px] text-[#8E9B90] mt-1 truncate">
                Salários & Pix
              </span>
            </div>

            {/* Expenses */}
            <div className="bg-[#1C241E] p-3 rounded-xl border border-[#2B372D] flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-[#F56565] font-semibold mb-1">
                <span className="flex items-center gap-1">
                  <ArrowUpRight size={13} />
                  <span>Saídas</span>
                </span>
                <span className="text-[10px] text-[#718073]">Gastos</span>
              </div>
              <div className="font-receipt-mono text-sm sm:text-base font-bold text-[#FAF8F2] tabular-nums">
                -{formatCurrency(totalExpenses)}
              </div>
              <span className="text-[10px] text-[#8E9B90] mt-1 truncate">
                Consumo geral
              </span>
            </div>

            {/* Net Investment Movement */}
            <div className="bg-[#1C241E] p-3 rounded-xl border border-[#2B372D] flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span
                  className={`flex items-center gap-1 ${
                    netInvested >= 0 ? 'text-[#71C4D1]' : 'text-[#ED8936]'
                  }`}
                >
                  <TrendingUp size={13} />
                  <span className="truncate">
                    {netInvested >= 0 ? 'Aporte' : 'Reserva'}
                  </span>
                </span>
              </div>
              <div
                className={`font-receipt-mono text-sm sm:text-base font-bold tabular-nums ${
                  netInvested >= 0 ? 'text-[#FAF8F2]' : 'text-[#ED8936]'
                }`}
              >
                {netInvested >= 0
                  ? `+${formatCurrency(netInvested)}`
                  : `-${formatCurrency(Math.abs(netInvested))}`}
              </div>
              <span className="text-[10px] text-[#8E9B90] mt-1 truncate">
                {netInvested >= 0 ? 'Guardado' : 'Resgatado'}
              </span>
            </div>
          </div>
        </div>

        {/* Hero Footer Bar: Savings Diagnostic & Direct Actions */}
        <div className="mt-4 pt-3.5 border-t border-[#263128] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          {/* Left: Financial Health Note */}
          <div className="flex items-center gap-2 text-[#C9C4B5] flex-wrap">
            {netInvested > 0 && totalIncomes > 0 ? (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#2E6B4F]/20 text-[#A7D7BC] border border-[#2E6B4F]/40 font-medium">
                <span>Taxa de Poupança:</span>
                <strong className="font-mono tabular-nums">{formatPercent(savingsRate)}</strong>
                <span className="text-[#8E9B90] hidden md:inline">da renda guardada</span>
              </div>
            ) : netInvested < 0 ? (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#B96A28]/20 text-[#E0B589] border border-[#B96A28]/40 font-medium">
                <span>Uso de Reserva:</span>
                <strong className="font-mono tabular-nums">{formatCurrency(Math.abs(netInvested))}</strong>
                <span className="text-[#A39E8E] hidden md:inline">resgatados (sem inflar receitas)</span>
              </div>
            ) : (
              <span className="text-[#8E9B90] flex items-center gap-1">
                <span>Movimentações operacionais registradas no período.</span>
              </span>
            )}

            {redeemedInvestments > 0 && netInvested >= 0 && (
              <span className="text-[11px] text-[#8E9B90] hidden lg:inline">
                · R$ {formatCurrency(redeemedInvestments)} resgatados de caixinhas caíram na conta corrente.
              </span>
            )}
          </div>

          {/* Right: Primary & Secondary Actions */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={onOpenFocusMode}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#222B24] hover:bg-[#2C382E] text-[#C9C4B5] hover:text-[#FAF8F2] border border-[#344237] transition-colors cursor-pointer"
              title="Atalho: tecla F"
            >
              <Sparkles size={13} className="text-[#71C4D1]" />
              <span>Modo Foco</span>
              <kbd className="hidden sm:inline font-mono text-[10px] bg-[#141A15] px-1.5 py-0.2 rounded border border-[#344237] text-[#8E9B90]">
                F
              </kbd>
            </button>

            <button
              type="button"
              onClick={onOpenSettingsModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#222B24] hover:bg-[#2C382E] text-[#C9C4B5] hover:text-[#FAF8F2] border border-[#344237] transition-colors cursor-pointer"
            >
              <SlidersHorizontal size={13} />
              <span>{hasOpeningBalance ? 'Ajustar Saldo' : 'Saldo Inicial'}</span>
            </button>

            <button
              type="button"
              onClick={onOpenImportModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#FAF8F2] hover:bg-[#EAE6D9] text-[#141A15] font-semibold transition-colors cursor-pointer shadow-xs"
            >
              <UploadCloud size={14} />
              <span>Importar CSV</span>
            </button>
          </div>
        </div>
      </div>

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
                Nenhum gasto classificado encontrado no período.
              </div>
            ) : (
              <div className="space-y-3 my-2">
                {topExpenseCategories.map((item) => {
                  const info = CATEGORIES[item.category];
                  const label = info ? info.label : item.category;
                  const color = info ? info.color : '#555C54';

                  return (
                    <div
                      key={item.category}
                      onClick={() => handleCategoryClick(item.category)}
                      className="group cursor-pointer hover:bg-[#F2ECE0] p-1.5 -mx-1.5 rounded-lg transition-colors"
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
                          <span className="text-[11px] text-[#7A8277] font-mono hidden sm:inline">
                            ({item.count} {item.count === 1 ? 'item' : 'itens'})
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-receipt-mono font-bold text-xs text-[#141A15] tabular-nums">
                            {formatCurrency(item.amount)}
                          </span>
                          <span className="font-mono text-[11px] text-[#7A8277] w-9 text-right tabular-nums">
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
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Hub Navigation Tiles (Bottom of Card) */}
          <div className="mt-4 pt-3 border-t border-[#EAE4D2] grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => onSelectTab('categories')}
              className="flex items-center justify-between p-2.5 rounded-xl bg-[#F0EDE1] hover:bg-[#E5E0D0] border border-[#DCD6C4] text-left transition-colors cursor-pointer group"
            >
              <div className="min-w-0">
                <span className="block font-semibold text-xs text-[#141A15] truncate">
                  14 Categorias & Metas
                </span>
                <span className="text-[10px] text-[#636A60] block truncate">
                  Mercado, Delivery, Transporte...
                </span>
              </div>
              <ChevronRight size={14} className="text-[#888E84] group-hover:translate-x-0.5 transition-transform shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('investments')}
              className="flex items-center justify-between p-2.5 rounded-xl bg-[#F0EDE1] hover:bg-[#E5E0D0] border border-[#DCD6C4] text-left transition-colors cursor-pointer group"
            >
              <div className="min-w-0">
                <span className="block font-semibold text-xs text-[#141A15] truncate">
                  Painel Investimentos
                </span>
                <span className="text-[10px] text-[#636A60] block truncate">
                  Caixinhas, RDB & Resgates
                </span>
              </div>
              <ChevronRight size={14} className="text-[#888E84] group-hover:translate-x-0.5 transition-transform shrink-0" />
            </button>
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
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#EDE8DC] text-[#555C54] border border-[#DCD6C4] tabular-nums">
              {recentTransactions.length} de {filteredTxns.length}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onSelectTab('statement')}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#141A15] hover:text-[#1F6672] transition-colors cursor-pointer bg-[#EDE8DC] hover:bg-[#E2DDCB] px-3 py-1.5 rounded-lg border border-[#D8D2C0]"
          >
            <span>Ver Extrato Completo</span>
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

              return (
                <div
                  key={txn.id}
                  className="py-2.5 flex items-center justify-between gap-3 hover:bg-[#F3EFE4] px-2 rounded-lg transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs sm:text-sm text-[#141A15] truncate">
                        {txn.displayName || txn.merchantKey || txn.desc}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-[#636A60] mt-0.5">
                      <span>{formatDateBR(txn.date)}</span>
                      <span>·</span>
                      <span className="truncate max-w-[240px]">{txn.desc}</span>
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

        <div className="mt-3.5 pt-3 border-t border-[#EAE4D2] text-center">
          <button
            type="button"
            onClick={() => onSelectTab('statement')}
            className="w-full py-2.5 rounded-xl bg-[#EDE8DC] hover:bg-[#E2DDCB] text-xs font-bold text-[#141A15] border border-[#D8D2C0] transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Acessar Extrato Completo com Busca, Filtros e Soma Rápida</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};
