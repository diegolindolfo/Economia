import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Sparkles,
  Sun,
  Sunrise,
  Moon,
  CalendarDays,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff,
  Maximize,
  Minimize,
  X,
  LayoutGrid,
  ArrowDownRight,
  ArrowUpRight,
} from 'lucide-react';
import { Category, Settings, Transaction } from '../types';
import { CATEGORIES } from '../lib/categorization/categories';
import { formatCurrency, formatDateBR, formatPercent } from '../lib/format';
import { CategoryChip } from './CategoryChip';
import { calculateAccountBalance } from '../lib/finance/balance';

interface FocusModeViewProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  settings: Settings;
  selectedMonth: string;
}

type FocusPeriod = 'overview' | 'daily' | 'weekly' | 'monthly';

export const FocusModeView: React.FC<FocusModeViewProps> = ({
  isOpen,
  onClose,
  transactions,
  settings,
  selectedMonth,
}) => {
  const [period, setPeriod] = useState<FocusPeriod>('overview');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hideValues, setHideValues] = useState(false);
  const [themeMode, setThemeMode] = useState<'paper' | 'dark'>('paper');

  // Dynamic Greeting based on time of day
  const greetingInfo = useMemo(() => {
    const now = new Date();
    const hour = now.getHours();

    let greeting = 'Bom dia';
    let icon = Sun;
    let periodName = 'manhã';

    if (hour >= 12 && hour < 18) {
      greeting = 'Boa tarde';
      icon = Sunrise;
      periodName = 'tarde';
    } else if (hour >= 18 || hour < 5) {
      greeting = 'Boa noite';
      icon = Moon;
      periodName = 'noite';
    }

    const weekdays = [
      'Domingo',
      'Segunda-feira',
      'Terça-feira',
      'Quarta-feira',
      'Quinta-feira',
      'Sexta-feira',
      'Sábado',
    ];
    const months = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ];

    const weekdayStr = weekdays[now.getDay()];
    const day = now.getDate();
    const monthStr = months[now.getMonth()];
    const year = now.getFullYear();

    const formattedFullDate = `${weekdayStr}, ${day} de ${monthStr} de ${year}`;

    return {
      greeting,
      icon,
      periodName,
      formattedFullDate,
      hour,
    };
  }, []);

  // Handle Fullscreen toggle
  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
          setIsFullscreen(false);
        }
      }
    } catch (_) {
      setIsFullscreen((prev) => !prev);
    }
  }, []);

  // Keyboard shortcut listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
      if (e.key.toLowerCase() === 'h') {
        setHideValues((prev) => !prev);
      }
      if (e.key.toLowerCase() === 'f') {
        toggleFullscreen();
      }
      if (e.key === '1') setPeriod('overview');
      if (e.key === '2') setPeriod('daily');
      if (e.key === '3') setPeriod('weekly');
      if (e.key === '4') setPeriod('monthly');
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    // Prevent background scrolling while open
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, toggleFullscreen]);

  // Compute Daily, Weekly, and Monthly data
  const { dailyData, weeklyData, monthlyData, overallBalance, accumulatedReserves, consolidatedWealth } = useMemo(() => {
    if (transactions.length === 0) {
      return {
        dailyData: { date: '', displayDate: '', expenses: 0, incomes: 0, applied: 0, redeemed: 0, net: 0, txns: [], count: 0 },
        weeklyData: { startDate: '', endDate: '', expenses: 0, incomes: 0, applied: 0, redeemed: 0, net: 0, dailyAvg: 0, topExpense: null, daysChart: [], count: 0 },
        monthlyData: { monthName: '', targetMonth: '', expenses: 0, incomes: 0, applied: 0, redeemed: 0, netInvested: 0, net: 0, topCategories: [], savingsRate: 0, count: 0 },
        overallBalance: 0,
        accumulatedReserves: 0,
        consolidatedWealth: 0,
      };
    }

    // 1. Overall Balance & Total Investment Reserves
    let allAppliedInvestments = 0;
    let allRedeemedInvestments = 0;
    transactions.forEach((t) => {
      if (t.category === 'investimento') {
        if (t.valor < 0) allAppliedInvestments += Math.abs(t.valor);
        else allRedeemedInvestments += t.valor;
      }
    });
    const overallBalance = calculateAccountBalance(transactions, settings);
    const accumulatedReserves = Math.max(0, allAppliedInvestments - allRedeemedInvestments);
    const consolidatedWealth = overallBalance + accumulatedReserves;

    // 2. DAILY DATA (Use today's date if exists, or latest transaction date)
    const todayIso = new Date().toISOString().split('T')[0];
    const hasTodayTxns = transactions.some((t) => t.date === todayIso);
    const targetDate = hasTodayTxns ? todayIso : (transactions[0]?.date || todayIso);

    const dayTxns = transactions.filter((t) => t.date === targetDate);
    let dayExpenses = 0;
    let dayIncomes = 0;
    let dayApplied = 0;
    let dayRedeemed = 0;

    dayTxns.forEach((t) => {
      if (t.category === 'investimento') {
        if (t.valor < 0) {
          dayApplied += Math.abs(t.valor);
        } else {
          dayRedeemed += t.valor;
        }
      } else if (t.valor > 0) {
        dayIncomes += t.valor;
      } else {
        dayExpenses += Math.abs(t.valor);
      }
    });

    const isToday = targetDate === todayIso;
    const [tY, tM, tD] = targetDate.split('-');
    const displayDate = isToday ? `Hoje (${tD}/${tM})` : `Último registro (${tD}/${tM}/${tY})`;

    const dailyData = {
      date: targetDate,
      isToday,
      displayDate,
      expenses: dayExpenses,
      incomes: dayIncomes,
      applied: dayApplied,
      redeemed: dayRedeemed,
      net: dayIncomes - dayExpenses,
      txns: dayTxns,
      count: dayTxns.length,
    };

    // 3. WEEKLY DATA (Last 7 days from target date)
    const targetDateObj = new Date(targetDate + 'T12:00:00');
    const past7DaysDates: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(targetDateObj);
      d.setDate(d.getDate() - i);
      past7DaysDates.push(d.toISOString().split('T')[0]);
    }

    const weekTxns = transactions.filter((t) => past7DaysDates.includes(t.date));
    let weekExpenses = 0;
    let weekIncomes = 0;
    let weekApplied = 0;
    let weekRedeemed = 0;
    let topExpense: Transaction | null = null;

    const daysChart = past7DaysDates.map((dStr) => {
      const dObj = new Date(dStr + 'T12:00:00');
      const dayName = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][dObj.getDay()];
      const dayNum = dStr.split('-')[2];

      const dTxns = weekTxns.filter((t) => t.date === dStr);
      let dayExp = 0;
      let dayInc = 0;
      dTxns.forEach((t) => {
        if (t.category === 'investimento') {
          if (t.valor < 0) {
            weekApplied += Math.abs(t.valor);
          } else {
            weekRedeemed += t.valor;
          }
        } else if (t.valor > 0) {
          dayInc += t.valor;
        } else {
          dayExp += Math.abs(t.valor);
          if (!topExpense || Math.abs(t.valor) > Math.abs(topExpense.valor)) {
            topExpense = t;
          }
        }
      });

      weekExpenses += dayExp;
      weekIncomes += dayInc;

      return {
        date: dStr,
        dayName,
        dayNum,
        expenses: dayExp,
        incomes: dayInc,
      };
    });

    const weeklyData = {
      startDate: past7DaysDates[0],
      endDate: past7DaysDates[past7DaysDates.length - 1],
      expenses: weekExpenses,
      incomes: weekIncomes,
      applied: weekApplied,
      redeemed: weekRedeemed,
      net: weekIncomes - weekExpenses,
      dailyAvg: weekExpenses / 7,
      topExpense,
      daysChart,
      count: weekTxns.length,
    };

    // 4. MONTHLY DATA (Current month or active filter month)
    const targetMonth =
      selectedMonth !== 'all'
        ? selectedMonth
        : (targetDate.substring(0, 7) || new Date().toISOString().substring(0, 7));

    const monthTxns = transactions.filter((t) => t.date.startsWith(targetMonth));
    let monthExpenses = 0;
    let monthIncomes = 0;
    let monthApplied = 0;
    let monthRedeemed = 0;
    const catTotals: Record<Category, number> = {} as any;

    monthTxns.forEach((t) => {
      if (t.category === 'investimento') {
        if (t.valor < 0) {
          monthApplied += Math.abs(t.valor);
        } else {
          monthRedeemed += t.valor;
        }
      } else if (t.valor > 0) {
        monthIncomes += t.valor;
      } else {
        const absVal = Math.abs(t.valor);
        monthExpenses += absVal;
        catTotals[t.category] = (catTotals[t.category] || 0) + absVal;
      }
    });

    const netInvested = monthApplied - monthRedeemed;

    // Top categories sorted
    const sortedCats = (Object.entries(catTotals) as [Category, number][])
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([cat, total]) => ({
        category: cat,
        total,
        percentage: monthExpenses > 0 ? (total / monthExpenses) * 100 : 0,
      }));

    // Real savings rate: net saved into investments divided by real income
    const savingsRate = monthIncomes > 0 ? (netInvested / monthIncomes) * 100 : 0;

    const [mYear, mMonth] = targetMonth.split('-');
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const monthName = `${monthNames[parseInt(mMonth, 10) - 1] || mMonth} de ${mYear}`;

    const monthlyData = {
      targetMonth,
      monthName,
      expenses: monthExpenses,
      incomes: monthIncomes,
      applied: monthApplied,
      redeemed: monthRedeemed,
      netInvested,
      net: monthIncomes - monthExpenses,
      savingsRate,
      topCategories: sortedCats,
      count: monthTxns.length,
    };

    return { dailyData, weeklyData, monthlyData, overallBalance, accumulatedReserves, consolidatedWealth };
  }, [transactions, settings, selectedMonth]);

  if (!isOpen) return null;

  const GreetingIcon = greetingInfo.icon;

  const renderValue = (val: number, showSign = false) => {
    if (hideValues) {
      return '••••••';
    }
    return formatCurrency(val, showSign);
  };

  const maxDayExpense = Math.max(...weeklyData.daysChart.map((d) => d.expenses), 1);

  const isDark = themeMode === 'dark';

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto flex flex-col transition-colors duration-300 ${
        isDark ? 'dark bg-[#141A15] text-[#FAF8F2]' : 'bg-[#EDE8DC] text-[#141A15]'
      }`}
    >
      {/* Top Floating Minimalist Bar */}
      <header
        className={`sticky top-0 z-30 px-5 sm:px-10 py-4 flex items-center justify-between border-b backdrop-blur-md transition-colors ${
          isDark
            ? 'bg-[#141A15]/95 border-[#2A352C]'
            : 'bg-[#EDE8DC]/95 border-[#D8D2C0]'
        }`}
      >
        {/* Left: Mode Stamp */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#2E6B4F] text-[#FAF8F2] flex items-center justify-center font-receipt-display font-bold text-base shadow-xs">
            <Sparkles size={17} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-receipt-display font-bold text-sm tracking-tight text-[#2E6B4F] dark:text-[#8FB397]">
                MODO FOCO
              </span>
              <span
                className={`text-[11px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                  isDark ? 'bg-[#222C24] text-[#A2B1A6]' : 'bg-[#DDD6C4] text-[#4F5950]'
                }`}
              >
                Zero Distrações
              </span>
            </div>
            <p className={`text-xs ${isDark ? 'text-[#8E9B90]' : 'text-[#646E65]'}`}>
              {greetingInfo.formattedFullDate}
            </p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {/* Privacy Toggle */}
          <button
            type="button"
            onClick={() => setHideValues((prev) => !prev)}
            title={hideValues ? 'Mostrar valores (H)' : 'Ocultar valores (H)'}
            className={`p-2 sm:px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              isDark
                ? 'bg-[#1E2720] border-[#2E3C31] text-[#C4CFC7] hover:text-white hover:bg-[#27342B]'
                : 'bg-[#FAF8F2] border-[#D8D2C0] text-[#3E473F] hover:text-[#141A15] hover:bg-[#F2ECE0]'
            }`}
          >
            {hideValues ? <EyeOff size={17} /> : <Eye size={17} />}
            <span className="hidden md:inline">{hideValues ? 'Mostrar' : 'Privacidade'}</span>
          </button>

          {/* Theme Mode Toggle */}
          <button
            type="button"
            onClick={() => setThemeMode((prev) => (prev === 'dark' ? 'paper' : 'dark'))}
            title="Alternar tema claro/escuro"
            className={`p-2 sm:px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              isDark
                ? 'bg-[#1E2720] border-[#2E3C31] text-[#C4CFC7] hover:text-white hover:bg-[#27342B]'
                : 'bg-[#FAF8F2] border-[#D8D2C0] text-[#3E473F] hover:text-[#141A15] hover:bg-[#F2ECE0]'
            }`}
          >
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
            <span className="hidden md:inline">{isDark ? 'Tema Papel' : 'Tema Escuro'}</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            title="Tela Cheia (F)"
            className={`p-2 sm:px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer hidden md:flex items-center gap-1.5 ${
              isDark
                ? 'bg-[#1E2720] border-[#2E3C31] text-[#C4CFC7] hover:text-white hover:bg-[#27342B]'
                : 'bg-[#FAF8F2] border-[#D8D2C0] text-[#3E473F] hover:text-[#141A15] hover:bg-[#F2ECE0]'
            }`}
          >
            {isFullscreen ? <Minimize size={17} /> : <Maximize size={17} />}
          </button>

          {/* Close Action */}
          <button
            type="button"
            onClick={onClose}
            title="Sair do Modo Foco (ESC)"
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-xs ${
              isDark
                ? 'bg-[#FAF8F2] text-[#141A15] hover:bg-[#ECE7D7]'
                : 'bg-[#141A15] text-[#FAF8F2] hover:bg-[#222B24]'
            }`}
          >
            <X size={16} />
            <span>Sair</span>
          </button>
        </div>
      </header>

      {/* Main Focus Canvas */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-5 sm:px-8 py-8 sm:py-12 space-y-10">
        {/* Big Editorial Greeting */}
        <section className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-[#2E6B4F]/15 text-[#2E6B4F] dark:text-[#8FB397] border border-[#2E6B4F]/25">
            <GreetingIcon size={16} />
            <span>Saudação do Momento</span>
          </div>

          <div className="space-y-2">
            <h1 className="font-receipt-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#141A15] dark:text-[#FAF8F2] leading-tight">
              {greetingInfo.greeting}.
            </h1>
            <p className={`text-base sm:text-xl font-sans max-w-2xl ${isDark ? 'text-[#A2ADA5]' : 'text-[#555C54]'}`}>
              Uma visão limpa, direta e sem distrações sobre para onde o seu dinheiro está indo.
            </p>
          </div>

          {/* Consolidated Wealth Header Bar */}
          <div className="pt-2">
            <div
              className={`p-4 sm:p-5 rounded-2xl border flex flex-wrap items-center justify-between gap-4 ${
                isDark ? 'bg-[#18211A] border-[#2A372C]' : 'bg-[#F4EFE6] border-[#DED7C6]'
              }`}
            >
              <div className="flex flex-wrap items-center gap-6 sm:gap-8">
                <div>
                  <span className={`text-xs font-mono font-bold uppercase tracking-wider block ${isDark ? 'text-[#A9B4AA]' : 'text-[#555C54]'}`}>
                    Saldo em Conta
                  </span>
                  <div className="font-receipt-mono text-xl sm:text-2xl font-bold tracking-tight text-[#141A15] dark:text-[#FAF8F2] mt-0.5">
                    {renderValue(overallBalance)}
                  </div>
                </div>

                {accumulatedReserves > 0 && (
                  <>
                    <div className={`hidden sm:block h-9 w-px ${isDark ? 'bg-[#2A372C]' : 'bg-[#DED7C6]'}`} />
                    <div>
                      <span className="text-xs font-mono font-bold uppercase tracking-wider block text-[#1F6672] dark:text-[#71C4D1]">
                        Caixinhas / RDB
                      </span>
                      <div className="font-receipt-mono text-xl sm:text-2xl font-bold tracking-tight text-[#1F6672] dark:text-[#71C4D1] mt-0.5">
                        {renderValue(accumulatedReserves)}
                      </div>
                    </div>

                    <div className={`hidden sm:block h-9 w-px ${isDark ? 'bg-[#2A372C]' : 'bg-[#DED7C6]'}`} />
                    <div>
                      <span className="text-xs font-mono font-bold uppercase tracking-wider block text-[#2E6B4F] dark:text-[#58B983]">
                        Patrimônio Total
                      </span>
                      <div className="font-receipt-mono text-xl sm:text-2xl font-bold tracking-tight text-[#2E6B4F] dark:text-[#58B983] mt-0.5">
                        {renderValue(consolidatedWealth)}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="text-xs text-[#8E9B90] hidden md:block">
                <span>Resgates não inflam suas receitas e entram direto no seu saldo disponível.</span>
              </div>
            </div>
          </div>
        </section>

        {/* Minimalist Segmented Tabs */}
        <nav
          className={`flex items-center p-1.5 rounded-2xl border transition-colors ${
            isDark ? 'bg-[#1B231D] border-[#2E3C31]' : 'bg-[#E2DC source] bg-[#DFD8C6] border-[#CEC5B2]'
          }`}
        >
          <button
            type="button"
            onClick={() => setPeriod('overview')}
            className={`flex-1 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              period === 'overview'
                ? isDark
                  ? 'bg-[#FAF8F2] text-[#141A15] shadow-sm'
                  : 'bg-[#141A15] text-[#FAF8F2] shadow-sm'
                : isDark
                ? 'text-[#8E9B90] hover:text-[#FAF8F2]'
                : 'text-[#555C54] hover:text-[#141A15]'
            }`}
          >
            <LayoutGrid size={18} />
            <span>Visão Completa</span>
          </button>

          <button
            type="button"
            onClick={() => setPeriod('daily')}
            className={`flex-1 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              period === 'daily'
                ? isDark
                  ? 'bg-[#FAF8F2] text-[#141A15] shadow-sm'
                  : 'bg-[#141A15] text-[#FAF8F2] shadow-sm'
                : isDark
                ? 'text-[#8E9B90] hover:text-[#FAF8F2]'
                : 'text-[#555C54] hover:text-[#141A15]'
            }`}
          >
            <Sun size={18} />
            <span>Hoje (Diário)</span>
          </button>

          <button
            type="button"
            onClick={() => setPeriod('weekly')}
            className={`flex-1 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              period === 'weekly'
                ? isDark
                  ? 'bg-[#FAF8F2] text-[#141A15] shadow-sm'
                  : 'bg-[#141A15] text-[#FAF8F2] shadow-sm'
                : isDark
                ? 'text-[#8E9B90] hover:text-[#FAF8F2]'
                : 'text-[#555C54] hover:text-[#141A15]'
            }`}
          >
            <CalendarDays size={18} />
            <span>Semanal (7 Dias)</span>
          </button>

          <button
            type="button"
            onClick={() => setPeriod('monthly')}
            className={`flex-1 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              period === 'monthly'
                ? isDark
                  ? 'bg-[#FAF8F2] text-[#141A15] shadow-sm'
                  : 'bg-[#141A15] text-[#FAF8F2] shadow-sm'
                : isDark
                ? 'text-[#8E9B90] hover:text-[#FAF8F2]'
                : 'text-[#555C54] hover:text-[#141A15]'
            }`}
          >
            <BarChart3 size={18} />
            <span>Mensal</span>
          </button>
        </nav>

        {/* 1. DIÁRIO (HOJE) - Large Typography Card */}
        {(period === 'overview' || period === 'daily') && (
          <section
            className={`rounded-3xl p-6 sm:p-10 border transition-all ${
              isDark
                ? 'bg-[#1C241E] border-[#2F3E32] shadow-md'
                : 'bg-[#FAF8F2] border-[#D8D2C0] shadow-sm'
            }`}
          >
            {/* Header with Title & Date */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#D8D2C0] dark:border-[#2F3E32]">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-[#2E6B4F]/15 text-[#2E6B4F] dark:text-[#8FB397]">
                  <Sun size={26} />
                </div>
                <div>
                  <h2 className="font-receipt-display text-2xl sm:text-3xl font-bold tracking-tight">
                    Resumo do Dia
                  </h2>
                  <span className={`text-xs sm:text-sm ${isDark ? 'text-[#8E9B90]' : 'text-[#555C54]'}`}>
                    {dailyData.displayDate} • {dailyData.count} {dailyData.count === 1 ? 'registro' : 'registros'}
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="self-start sm:self-center">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold uppercase ${
                    dailyData.net >= 0
                      ? 'bg-[#2E6B4F]/15 text-[#2E6B4F] dark:text-[#58B983] border border-[#2E6B4F]/30'
                      : 'bg-[#C75450]/15 text-[#C75450] dark:text-[#DE7777] border border-[#C75450]/30'
                  }`}
                >
                  {dailyData.net >= 0 ? (
                    <ArrowUpRight size={15} />
                  ) : (
                    <ArrowDownRight size={15} />
                  )}
                  <span>Saldo Líquido: {renderValue(dailyData.net, true)}</span>
                </span>
              </div>
            </div>

            {/* Big Hero Numbers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-8">
              {/* Daily Outflow Big Highlight */}
              <div
                className={`p-6 sm:p-8 rounded-2xl border ${
                  isDark
                    ? 'bg-[#151C17] border-[#2A362D]'
                    : 'bg-[#F4EFE6] border-[#DED7C6]'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono font-bold uppercase text-[#C75450] dark:text-[#DE7777] mb-2">
                  <span className="flex items-center gap-1.5">
                    <TrendingDown size={18} />
                    <span>Total Saídas Hoje</span>
                  </span>
                  <span>Gasto</span>
                </div>
                <div className="font-receipt-display text-4xl sm:text-5xl font-bold tracking-tight text-[#C75450] dark:text-[#DE7777]">
                  {renderValue(dailyData.expenses)}
                </div>
                <p className={`text-xs mt-2 ${isDark ? 'text-[#8E9B90]' : 'text-[#646E65]'}`}>
                  {dailyData.expenses === 0
                    ? 'Nenhum gasto registrado até o momento'
                    : 'Consumo registrado nas últimas horas'}
                </p>
              </div>

              {/* Daily Inflow Big Highlight */}
              <div
                className={`p-6 sm:p-8 rounded-2xl border ${
                  isDark
                    ? 'bg-[#151C17] border-[#2A362D]'
                    : 'bg-[#F4EFE6] border-[#DED7C6]'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono font-bold uppercase text-[#2E6B4F] dark:text-[#58B983] mb-2">
                  <span className="flex items-center gap-1.5">
                    <TrendingUp size={18} />
                    <span>Receitas Reais Hoje</span>
                  </span>
                  <span>Recebido</span>
                </div>
                <div className="font-receipt-display text-4xl sm:text-5xl font-bold tracking-tight text-[#2E6B4F] dark:text-[#58B983]">
                  {renderValue(dailyData.incomes)}
                </div>
                <p className={`text-xs mt-2 ${isDark ? 'text-[#8E9B90]' : 'text-[#646E65]'}`}>
                  {dailyData.incomes > 0 ? 'Receitas recebidas (exclui resgates)' : 'Nenhuma receita hoje'}
                </p>
              </div>
            </div>

            {/* Daily Reserve Banner if any redemption or investment occurred */}
            {(dailyData.redeemed > 0 || dailyData.applied > 0) && (
              <div
                className={`-mt-2 mb-6 p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-2 text-xs ${
                  isDark
                    ? 'bg-[#1F6672]/15 border-[#1F6672]/30 text-[#71C4D1]'
                    : 'bg-[#1F6672]/10 border-[#1F6672]/25 text-[#1F6672]'
                }`}
              >
                <div className="flex items-center gap-2 font-medium">
                  <TrendingUp size={17} />
                  <span>
                    {dailyData.redeemed > 0 && dailyData.applied > 0
                      ? `Caixinhas/RDB: ${renderValue(dailyData.applied)} aplicados · ${renderValue(dailyData.redeemed)} resgatados`
                      : dailyData.redeemed > 0
                      ? `Resgate de Reserva: ${renderValue(dailyData.redeemed)} creditados na conta hoje.`
                      : `Aporte em Reserva: ${renderValue(dailyData.applied)} guardados em caixinhas hoje.`}
                  </span>
                </div>
                {dailyData.redeemed > 0 && (
                  <span className="text-xs opacity-90">
                    O dinheiro já está disponível no seu saldo da conta, mas não entra nas receitas do dia.
                  </span>
                )}
              </div>
            )}

            {/* Daily Transactions Clean Feed */}
            {dailyData.txns.length > 0 ? (
              <div className="space-y-3">
                <span className={`text-xs font-mono font-bold uppercase tracking-wider block ${isDark ? 'text-[#8E9B90]' : 'text-[#646E65]'}`}>
                  Lançamentos do Dia ({dailyData.txns.length})
                </span>
                <div
                  className={`divide-y rounded-2xl border overflow-hidden ${
                    isDark
                      ? 'divide-[#2A362D] border-[#2A362D] bg-[#151C17]'
                      : 'divide-[#E6E0D2] border-[#DED7C6] bg-white'
                  }`}
                >
                  {dailyData.txns.map((t) => {
                    const isIncome = t.valor > 0;
                    return (
                      <div
                        key={t.id}
                        className="px-5 py-4 flex items-center justify-between gap-4 text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <CategoryChip category={t.category} />
                          <span className="font-semibold truncate text-[#141A15] dark:text-[#FAF8F2]">
                            {t.displayName || t.desc}
                          </span>
                        </div>
                        <div
                          className={`font-receipt-mono text-base font-bold whitespace-nowrap ${
                            isIncome
                              ? 'text-[#2E6B4F] dark:text-[#58B983]'
                              : 'text-[#C75450] dark:text-[#DE7777]'
                          }`}
                        >
                          {renderValue(t.valor, true)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div
                className={`p-8 rounded-2xl border text-center text-sm ${
                  isDark
                    ? 'border-[#2A362D] text-[#8E9B90] bg-[#151C17]'
                    : 'border-[#DED7C6] text-[#646E65] bg-white'
                }`}
              >
                Nenhum lançamento no extrato para esta data.
              </div>
            )}
          </section>
        )}

        {/* 2. SEMANAL (7 DIAS) - Large Typography Card */}
        {(period === 'overview' || period === 'weekly') && (
          <section
            className={`rounded-3xl p-6 sm:p-10 border transition-all ${
              isDark
                ? 'bg-[#1C241E] border-[#2F3E32] shadow-md'
                : 'bg-[#FAF8F2] border-[#D8D2C0] shadow-sm'
            }`}
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#D8D2C0] dark:border-[#2F3E32]">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-[#B96A28]/15 text-[#B96A28] dark:text-[#E08D46]">
                  <CalendarDays size={26} />
                </div>
                <div>
                  <h2 className="font-receipt-display text-2xl sm:text-3xl font-bold tracking-tight">
                    Resumo Semanal
                  </h2>
                  <span className={`text-xs sm:text-sm ${isDark ? 'text-[#8E9B90]' : 'text-[#555C54]'}`}>
                    Últimos 7 dias ({formatDateBR(weeklyData.startDate)} até {formatDateBR(weeklyData.endDate)})
                  </span>
                </div>
              </div>

              {/* Total Weekly Expense Stat */}
              <div className="text-left sm:text-right">
                <span className={`text-xs font-mono uppercase block ${isDark ? 'text-[#8E9B90]' : 'text-[#646E65]'}`}>
                  Total Gasto na Semana
                </span>
                <span className="font-receipt-display text-2xl sm:text-3xl font-bold text-[#C75450] dark:text-[#DE7777]">
                  {renderValue(weeklyData.expenses)}
                </span>
              </div>
            </div>

            {/* Weekly 3-Column Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8">
              {/* Daily Average */}
              <div
                className={`p-5 rounded-2xl border ${
                  isDark ? 'bg-[#151C17] border-[#2A362D]' : 'bg-[#F4EFE6] border-[#DED7C6]'
                }`}
              >
                <span className={`text-xs font-mono font-bold uppercase block ${isDark ? 'text-[#8E9B90]' : 'text-[#646E65]'}`}>
                  Média de Consumo
                </span>
                <div className="font-receipt-display text-2xl sm:text-3xl font-bold mt-1 text-[#141A15] dark:text-[#FAF8F2]">
                  {renderValue(weeklyData.dailyAvg)}
                  <span className="text-xs font-sans font-normal text-[#8E9B90]"> / dia</span>
                </div>
              </div>

              {/* Weekly Incomes */}
              <div
                className={`p-5 rounded-2xl border ${
                  isDark ? 'bg-[#151C17] border-[#2A362D]' : 'bg-[#F4EFE6] border-[#DED7C6]'
                }`}
              >
                <span className="text-xs font-mono font-bold uppercase block text-[#2E6B4F] dark:text-[#58B983]">
                  Receitas na Semana
                </span>
                <div className="font-receipt-display text-2xl sm:text-3xl font-bold mt-1 text-[#2E6B4F] dark:text-[#58B983]">
                  {renderValue(weeklyData.incomes)}
                </div>
                {weeklyData.redeemed > 0 ? (
                  <span className="text-xs text-[#A9B4AA] block mt-1">
                    + {renderValue(weeklyData.redeemed)} resgatados de reserva
                  </span>
                ) : (
                  <span className="text-xs text-[#A9B4AA] block mt-1">
                    Ganhos reais no período
                  </span>
                )}
              </div>

              {/* Top Single Expense */}
              <div
                className={`p-5 rounded-2xl border ${
                  isDark ? 'bg-[#151C17] border-[#2A362D]' : 'bg-[#F4EFE6] border-[#DED7C6]'
                }`}
              >
                <span className="text-xs font-mono font-bold uppercase block text-[#B96A28] dark:text-[#E08D46]">
                  Maior Gasto Único
                </span>
                <div className="text-sm font-semibold truncate mt-1">
                  {weeklyData.topExpense ? (
                    <div>
                      <span className="font-receipt-mono text-base font-bold text-[#C75450] dark:text-[#DE7777] block">
                        {renderValue(Math.abs(weeklyData.topExpense.valor))}
                      </span>
                      <span className="text-xs text-[#8E9B90] truncate block">
                        {weeklyData.topExpense.displayName || weeklyData.topExpense.desc}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-[#8E9B90]">Nenhum gasto registrado</span>
                  )}
                </div>
              </div>
            </div>

            {/* 7-Day Activity Chart */}
            <div className="space-y-3">
              <span className={`text-xs font-mono font-bold uppercase tracking-wider block ${isDark ? 'text-[#8E9B90]' : 'text-[#646E65]'}`}>
                Distribuição de Gastos Dia a Dia
              </span>
              <div
                className={`p-6 rounded-2xl border grid grid-cols-7 gap-2 sm:gap-4 items-end min-h-[170px] ${
                  isDark ? 'bg-[#151C17] border-[#2A362D]' : 'bg-white border-[#DED7C6]'
                }`}
              >
                {weeklyData.daysChart.map((day) => {
                  const heightPercent =
                    maxDayExpense > 0
                      ? Math.max(8, Math.round((day.expenses / maxDayExpense) * 100))
                      : 8;
                  const isZero = day.expenses === 0;

                  return (
                    <div key={day.date} className="flex flex-col items-center gap-2 h-full justify-end group">
                      <span className="text-xs font-receipt-mono text-[#A9B4AA] hidden sm:block">
                        {isZero ? '-' : renderValue(day.expenses)}
                      </span>
                      <div className="w-full max-w-[36px] h-24 flex items-end justify-center bg-[#E5DEC9]/40 dark:bg-[#2A362D]/40 rounded-xl overflow-hidden p-0.5">
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full rounded-lg transition-all duration-500 ${
                            isZero
                              ? 'bg-transparent'
                              : 'bg-gradient-to-t from-[#B96A28] to-[#D98236]'
                          }`}
                        />
                      </div>
                      <span className="text-xs font-bold text-[#141A15] dark:text-[#FAF8F2]">{day.dayName}</span>
                      <span className="text-[11px] text-[#A9B4AA] -mt-1 font-mono">{day.dayNum}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* 3. MENSAL - Large Typography Card */}
        {(period === 'overview' || period === 'monthly') && (
          <section
            className={`rounded-3xl p-6 sm:p-10 border transition-all ${
              isDark
                ? 'bg-[#1C241E] border-[#2F3E32] shadow-md'
                : 'bg-[#FAF8F2] border-[#D8D2C0] shadow-sm'
            }`}
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#D8D2C0] dark:border-[#2F3E32]">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-[#2E6B4F]/15 text-[#2E6B4F] dark:text-[#8FB397]">
                  <BarChart3 size={26} />
                </div>
                <div>
                  <h2 className="font-receipt-display text-2xl sm:text-3xl font-bold tracking-tight">
                    Resumo Mensal
                  </h2>
                  <span className={`text-xs sm:text-sm ${isDark ? 'text-[#8E9B90]' : 'text-[#555C54]'}`}>
                    {monthlyData.monthName} • {monthlyData.count} transações registradas
                  </span>
                </div>
              </div>

              {/* Monthly Net Hero */}
              <div className="text-left sm:text-right">
                <span className={`text-xs font-mono uppercase block ${isDark ? 'text-[#8E9B90]' : 'text-[#646E65]'}`}>
                  Balanço Líquido do Mês
                </span>
                <span
                  className={`font-receipt-display text-2xl sm:text-4xl font-bold ${
                    monthlyData.net >= 0
                      ? 'text-[#2E6B4F] dark:text-[#58B983]'
                      : 'text-[#C75450] dark:text-[#DE7777]'
                  }`}
                >
                  {renderValue(monthlyData.net, true)}
                </span>
              </div>
            </div>

            {/* 4 Clean Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-8">
              <div
                className={`p-5 rounded-2xl border ${
                  isDark ? 'bg-[#151C17] border-[#2A362D]' : 'bg-[#F4EFE6] border-[#DED7C6]'
                }`}
              >
                <span className="text-xs font-mono font-bold uppercase block text-[#2E6B4F] dark:text-[#58B983]">
                  Receitas
                </span>
                <div className="font-receipt-display text-2xl font-bold mt-1 text-[#2E6B4F] dark:text-[#58B983]">
                  {renderValue(monthlyData.incomes)}
                </div>
                <span className="text-xs text-[#A9B4AA] block mt-1">Ganhos reais do mês</span>
              </div>

              <div
                className={`p-5 rounded-2xl border ${
                  isDark ? 'bg-[#151C17] border-[#2A362D]' : 'bg-[#F4EFE6] border-[#DED7C6]'
                }`}
              >
                <span className="text-xs font-mono font-bold uppercase block text-[#C75450] dark:text-[#DE7777]">
                  Saídas
                </span>
                <div className="font-receipt-display text-2xl font-bold mt-1 text-[#C75450] dark:text-[#DE7777]">
                  {renderValue(monthlyData.expenses)}
                </div>
                <span className="text-xs text-[#A9B4AA] block mt-1">Despesas e consumo</span>
              </div>

              <div
                className={`p-5 rounded-2xl border ${
                  isDark ? 'bg-[#151C17] border-[#2A362D]' : 'bg-[#F4EFE6] border-[#DED7C6]'
                }`}
              >
                <span className={`text-xs font-mono font-bold uppercase block ${monthlyData.netInvested >= 0 ? 'text-[#1F6672] dark:text-[#71C4D1]' : 'text-[#B96A28] dark:text-[#E08D46]'}`}>
                  {monthlyData.netInvested >= 0 ? 'Aporte Líquido' : 'Uso de Reserva'}
                </span>
                <div className={`font-receipt-display text-2xl font-bold mt-1 ${monthlyData.netInvested >= 0 ? 'text-[#1F6672] dark:text-[#71C4D1]' : 'text-[#B96A28] dark:text-[#E08D46]'}`}>
                  {renderValue(monthlyData.netInvested, true)}
                </div>
                <span className="text-xs text-[#A9B4AA] block mt-1">
                  {monthlyData.redeemed > 0
                    ? `${renderValue(monthlyData.applied)} aplic. · ${renderValue(monthlyData.redeemed)} resg.`
                    : 'Caixinhas / RDB'}
                </span>
              </div>

              <div
                className={`p-5 rounded-2xl border ${
                  isDark ? 'bg-[#151C17] border-[#2A362D]' : 'bg-[#F4EFE6] border-[#DED7C6]'
                }`}
              >
                <span className="text-xs font-mono font-bold uppercase block text-[#B96A28] dark:text-[#E08D46]">
                  Taxa de Poupança
                </span>
                <div className="font-receipt-display text-2xl font-bold mt-1 text-[#B96A28] dark:text-[#E08D46]">
                  {formatPercent(monthlyData.savingsRate)}
                </div>
                <span className="text-xs text-[#A9B4AA] block mt-1">
                  {monthlyData.savingsRate > 0
                    ? 'da renda guardada'
                    : monthlyData.netInvested < 0
                    ? 'uso de reserva no mês'
                    : 'sem economia líquida'}
                </span>
              </div>
            </div>

            {/* Monthly Reserve Notice */}
            {monthlyData.redeemed > 0 && (
              <div
                className={`-mt-4 mb-8 p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-2 text-xs ${
                  isDark
                    ? 'bg-[#1F6672]/15 border-[#1F6672]/30 text-[#71C4D1]'
                    : 'bg-[#1F6672]/10 border-[#1F6672]/25 text-[#1F6672]'
                }`}
              >
                <div className="flex items-center gap-2 font-medium">
                  <TrendingUp size={17} />
                  <span>
                    Resgates de Reserva no Mês: foram resgatados <strong>{renderValue(monthlyData.redeemed)}</strong> de investimentos.
                  </span>
                </div>
                <span className="text-xs opacity-90">
                  Esse valor foi creditado na conta corrente, sem inflar sua receita do mês.
                </span>
              </div>
            )}

            {/* Top Categories Minimal Bars */}
            {monthlyData.topCategories.length > 0 && (
              <div className="space-y-4">
                <span className={`text-xs font-mono font-bold uppercase tracking-wider block ${isDark ? 'text-[#8E9B90]' : 'text-[#646E65]'}`}>
                  Maiores Categorias de Consumo no Mês
                </span>
                <div className="space-y-4">
                  {monthlyData.topCategories.map((item) => {
                    const catMeta = CATEGORIES[item.category];
                    return (
                      <div key={item.category} className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span>{catMeta?.icon || '📦'}</span>
                            <span className="font-semibold">{catMeta?.label || item.category}</span>
                          </div>
                          <div className="flex items-center gap-2 font-receipt-mono text-sm">
                            <span className="font-bold">{renderValue(item.total)}</span>
                            <span className={`text-xs ${isDark ? 'text-[#8E9B90]' : 'text-[#758076]'}`}>
                              ({formatPercent(item.percentage)})
                            </span>
                          </div>
                        </div>
                        <div
                          className={`w-full h-2.5 rounded-full overflow-hidden ${
                            isDark ? 'bg-[#2A362D]' : 'bg-[#E3DCBD]'
                          }`}
                        >
                          <div
                            style={{
                              width: `${Math.min(100, Math.max(4, item.percentage))}%`,
                              backgroundColor: catMeta?.color || '#2E6B4F',
                            }}
                            className="h-full rounded-full transition-all duration-500"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Footer Minimalist Keys */}
        <footer className="text-center pt-6 pb-12 space-y-2">
          <p className={`text-xs font-sans ${isDark ? 'text-[#627065]' : 'text-[#879389]'}`}>
            Atalhos: <kbd className="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 font-mono text-[10px]">ESC</kbd> fechar • <kbd className="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 font-mono text-[10px]">H</kbd> privacidade • <kbd className="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 font-mono text-[10px]">1-4</kbd> alternar abas
          </p>
        </footer>
      </main>
    </div>
  );
};
