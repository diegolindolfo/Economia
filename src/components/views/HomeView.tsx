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

  const hasOpeningBalance = settings.openingBalance !== null && settings.openingBalance !== undefined;
  const displayBalance = calculateAccountBalance(transactions, settings);

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
          <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
            <div className="p-6 sm:p-10 lg:p-12">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#D8D2C0] bg-white/70 px-3 py-1.5 text-xs font-semibold text-[#48634F]">
                <Sparkles size={14} aria-hidden="true" />
                Seu espaço financeiro, sem complicação
              </span>
              <h1
                id="welcome-title"
                className="mt-5 max-w-xl font-receipt-display text-3xl font-bold leading-tight tracking-tight text-[#141A15] sm:text-4xl lg:text-5xl"
              >
                Mais clareza para cuidar do seu dinheiro.
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-[#555C54] sm:text-base sm:leading-7">
                Importe seu extrato e veja receitas, gastos e investimentos organizados em um só lugar.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <button
                  type="button"
                  onClick={onOpenImportModal}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#1E4D37] px-5 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#173D2C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E4D37]"
                >
                  <UploadCloud size={17} aria-hidden="true" />
                  Importar meu extrato CSV
                  <ArrowRight size={16} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={onLoadSample}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#CFC8B5] bg-white/70 px-5 py-3 text-sm font-semibold text-[#26372B] transition-colors hover:bg-[#F0EDE1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E4D37]"
                >
                  <Sparkles size={16} aria-hidden="true" />
                  Explorar dados de exemplo
                </button>
              </div>

              <p className="mt-5 flex items-center gap-2 text-xs leading-5 text-[#636A60] sm:text-sm">
                <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-[#2E6B4F]" />
                Seus lançamentos ficam salvos neste navegador.
              </p>
            </div>

            <div className="border-t border-[#D8D2C0] bg-[#F1EEE4] p-6 sm:p-10 lg:border-l lg:border-t-0 lg:p-10">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#636A60]">
                Em três passos
              </p>
              <ol className="mt-5 space-y-3">
                {[
                  { title: 'Importe o extrato', detail: 'Comece com um arquivo CSV do seu banco.', icon: UploadCloud },
                  { title: 'Revise as categorias', detail: 'Ajuste qualquer classificação do seu jeito.', icon: SlidersHorizontal },
                  { title: 'Acompanhe sua evolução', detail: 'Entenda seu saldo e para onde vai o dinheiro.', icon: TrendingUp },
                ].map((step, index) => {
                  const StepIcon = step.icon;
                  return (
                    <li key={step.title} className="flex gap-3 rounded-2xl border border-[#DED8C7] bg-[#FAF8F2] p-4">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E4EADF] text-[#2E6B4F]">
                        <StepIcon size={18} aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#1E241F]">{index + 1}. {step.title}</p>
                        <p className="mt-1 text-xs leading-5 text-[#636A60] sm:text-sm">{step.detail}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
              <div className="mt-5 flex items-center gap-2 text-xs leading-5 text-[#636A60]">
                <Wallet size={15} className="shrink-0 text-[#2E6B4F]" aria-hidden="true" />
                <span>Você pode começar pelos dados de exemplo e importar os seus depois.</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    ) : (
    <div className="space-y-4 sm:space-y-6">
      {/* Selected period filters flow metrics; the account balance below is always current. */}
      <div className="bg-[#FAF8F2] border border-[#D8D2C0] rounded-xl px-4 py-3 sm:px-5 sm:py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 shadow-2xs">
        <div className="shrink-0">
          <p className="text-xs uppercase font-bold tracking-wider text-[#555C54]">
            Período dos indicadores
          </p>
          <p className="text-xs text-[#636A60] mt-0.5">
            {selectedMonth === 'all'
              ? 'Todo o histórico'
              : `${selectedMonth.split('-')[1]}/${selectedMonth.split('-')[0]}`}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 min-w-0">
          <MonthSelector
            transactions={transactions}
            selectedMonth={selectedMonth}
            onSelectMonth={onSelectMonth}
          />
          <span className="text-xs text-[#555C54] shrink-0">
            {filteredTxns.length}{' '}
            {filteredTxns.length === 1 ? 'lançamento' : 'lançamentos'}
          </span>
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
              <span className="text-xs uppercase font-semibold tracking-wider text-[#B2BBAF]">
                {hasOpeningBalance ? 'Saldo atual em conta corrente' : 'Saldo estimado em conta corrente'}
              </span>
              <span
                className={`text-xs uppercase font-mono px-2 py-0.5 rounded ${
                  hasOpeningBalance
                    ? 'bg-[#2E6B4F]/40 text-[#A7D7BC] border border-[#2E6B4F]/50'
                    : 'bg-[#28322A] text-[#C9C4B5] border border-[#3A483D]'
                }`}
              >
                {hasOpeningBalance ? 'Saldo base + movimentos' : 'Sem saldo inicial configurado'}
              </span>
            </div>

            <div className="font-receipt-mono text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#FAF8F2] tabular-nums">
              {formatCurrency(displayBalance)}
            </div>

            {/* Clean Unboxed Metadata Strip (Zero-Pill Discipline) */}
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-[#B2BBAF]">
              <span className="inline-flex items-center gap-1.5">
                <Wallet size={14} className="text-[#A9B4AA]" />
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

            </div>
          </div>

          {/* Quick Flow Pulse Ledger (3 Balanced Columns) */}
          <div className="w-full lg:w-auto lg:min-w-[420px] pt-3 lg:pt-0 border-t lg:border-t-0 border-[#263128]">
            <p className="mb-2 text-xs uppercase font-bold tracking-wider text-[#B2BBAF]">
              Fluxo no período selecionado
            </p>
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
              {/* Real Incomes */}
              <div className="bg-[#1C241E] p-3 rounded-xl border border-[#2B372D] flex flex-col justify-between min-w-0">
                <div className="flex items-center gap-1.5 text-xs text-[#48BB78] font-semibold mb-1">
                  <span className="flex items-center gap-1">
                    <ArrowDownLeft size={13} />
                    <span>Receitas</span>
                  </span>
                </div>
                <div className="font-receipt-mono text-sm sm:text-base font-bold text-[#FAF8F2] tabular-nums">
                  +{formatCurrency(totalIncomes)}
                </div>
                <span className="text-xs text-[#A9B4AA] mt-1 truncate">
                  Entradas reais
                </span>
              </div>

              {/* Expenses */}
              <div className="bg-[#1C241E] p-3 rounded-xl border border-[#2B372D] flex flex-col justify-between min-w-0">
                <div className="flex items-center gap-1.5 text-xs text-[#F56565] font-semibold mb-1">
                  <span className="flex items-center gap-1">
                    <ArrowUpRight size={13} />
                    <span>Saídas</span>
                  </span>
                </div>
                <div className="font-receipt-mono text-sm sm:text-base font-bold text-[#FAF8F2] tabular-nums">
                  -{formatCurrency(totalExpenses)}
                </div>
                <span className="text-xs text-[#A9B4AA] mt-1 truncate">
                  Consumo geral
                </span>
              </div>

              {/* Net Investment Movement */}
              <div className="bg-[#1C241E] p-3 rounded-xl border border-[#2B372D] flex flex-col justify-between min-w-0">
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
                <span className="text-xs text-[#A9B4AA] mt-1 truncate">
                  {netInvested >= 0 ? 'Guardado' : 'Resgatado'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section
        aria-label="Saúde financeira e ações rápidas"
        className="rounded-2xl border border-[#D8D2C0] bg-[#FAF8F2] p-3 sm:p-4 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4"
      >
        <div className="min-w-0">
          <p className="text-xs uppercase font-bold tracking-wider text-[#555C54]">
            Saúde financeira do período
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
            {netInvested > 0 && totalIncomes > 0 ? (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#E4EADF] text-[#24563B] border border-[#BFCFBE] font-semibold">
                <span>Taxa de poupança:</span>
                <strong className="font-mono tabular-nums">{formatPercent(savingsRate)}</strong>
                <span>da renda guardada</span>
              </div>
            ) : netInvested < 0 ? (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F4E7D8] text-[#85501F] border border-[#E3C9A8] font-semibold">
                <span>Uso de reserva:</span>
                <strong className="font-mono tabular-nums">{formatCurrency(Math.abs(netInvested))}</strong>
                <span>resgatados, sem inflar receitas</span>
              </div>
            ) : (
              <span className="text-[#555C54]">
                Movimentações operacionais registradas no período.
              </span>
            )}

            {redeemedInvestments > 0 && netInvested >= 0 && (
              <span className="text-xs text-[#555C54]">
                {formatCurrency(redeemedInvestments)} resgatados de reservas foram para a conta.
              </span>
            )}
          </div>
        </div>

        <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-3 lg:w-auto lg:min-w-[420px]">
          <button
            type="button"
            onClick={onOpenImportModal}
            className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg bg-[#1E4D37] px-3 py-2 text-xs font-bold text-white shadow-xs transition-colors hover:bg-[#173D2C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E4D37]"
          >
            <UploadCloud size={15} aria-hidden="true" />
            <span>Importar CSV</span>
          </button>

          <button
            type="button"
            onClick={onOpenSettingsModal}
            className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-[#CFC8B5] bg-white px-3 py-2 text-xs font-semibold text-[#26372B] transition-colors hover:bg-[#F0EDE1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E4D37]"
          >
            <SlidersHorizontal size={15} aria-hidden="true" />
            <span>{hasOpeningBalance ? 'Ajustar saldo' : 'Saldo inicial'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenFocusMode}
            title="Atalho: tecla F"
            className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-[#CFC8B5] bg-white px-3 py-2 text-xs font-semibold text-[#26372B] transition-colors hover:bg-[#F0EDE1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E4D37]"
          >
            <Sparkles size={15} className="text-[#1F6672]" aria-hidden="true" />
            <span>Modo Foco</span>
            <kbd className="hidden sm:inline font-mono text-[11px] bg-[#F0EDE1] px-1.5 py-0.5 rounded border border-[#D8D2C0] text-[#555C54]">
              F
            </kbd>
          </button>
        </div>
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
                          <span className="text-xs text-[#636A60] font-mono hidden sm:inline">
                            ({item.count} {item.count === 1 ? 'item' : 'itens'})
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
                <span className="text-xs text-[#636A60] block truncate">
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
                <span className="text-xs text-[#636A60] block truncate">
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
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#EDE8DC] text-[#555C54] border border-[#DCD6C4] tabular-nums">
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
                    <div className="flex items-center gap-2 text-xs text-[#555C54] mt-0.5">
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
    )
  );
};
