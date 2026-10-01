import React from 'react';
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
} from 'lucide-react';
import { Category, Settings, Transaction } from '../../types';
import { formatCurrency, formatDateBR, formatPercent } from '../../lib/format';
import { MonthSelector } from '../MonthSelector';
import { StatCarousel } from '../StatCarousel';
import { DaySummary } from '../DaySummary';
import { CategoryChip } from '../CategoryChip';
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
}) => {
  // Compute balances
  const filteredTxns =
    selectedMonth === 'all'
      ? transactions
      : transactions.filter((t) => t.date.startsWith(selectedMonth));

  let totalNet = 0;
  let totalIncomes = 0;
  let totalExpenses = 0;
  let appliedInvestments = 0;
  let redeemedInvestments = 0;

  filteredTxns.forEach((t) => {
    totalNet += t.valor;
    if (t.category === 'investimento') {
      if (t.valor < 0) {
        appliedInvestments += Math.abs(t.valor);
      } else {
        redeemedInvestments += t.valor;
      }
    } else if (t.valor > 0) {
      totalIncomes += t.valor;
    } else {
      totalExpenses += Math.abs(t.valor);
    }
  });

  const netInvested = appliedInvestments - redeemedInvestments;

  // Compute accumulated investment reserves across all transactions
  let totalAllNet = 0;
  let allAppliedInvestments = 0;
  let allRedeemedInvestments = 0;
  transactions.forEach((t) => {
    totalAllNet += t.valor;
    if (t.category === 'investimento') {
      if (t.valor < 0) allAppliedInvestments += Math.abs(t.valor);
      else allRedeemedInvestments += t.valor;
    }
  });
  const totalAccumulatedReserves = Math.max(0, allAppliedInvestments - allRedeemedInvestments);

  const hasOpeningBalance =
    settings.openingBalance !== null && settings.openingBalance !== undefined;
  const displayBalance = hasOpeningBalance
    ? (settings.openingBalance || 0) + totalNet
    : totalNet;

  const totalConsolidatedWealth = displayBalance + totalAccumulatedReserves;

  // Real savings rate: net saved into investments relative to genuine income
  const savingsRate = totalIncomes > 0 ? (netInvested / totalIncomes) * 100 : 0;

  // Recent 6 transactions for clean home preview
  const recentTransactions = [...filteredTxns].slice(0, 6);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Clean Hero Card */}
      <div className="bg-[#141A15] text-[#FAF8F2] rounded-2xl p-4 sm:p-6 shadow-md border border-[#2B352D] relative overflow-hidden">
        {/* Decorative background watermarks */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-radial from-[#253328]/40 to-transparent pointer-events-none -mr-20 -mt-20 rounded-full" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase font-semibold tracking-wider text-[#A39E8E]">
                {hasOpeningBalance ? 'Saldo em Conta Corrente' : 'Movimentação Líquida'}
              </span>
              <span
                className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-md ${
                  hasOpeningBalance
                    ? 'bg-[#2E6B4F] text-white'
                    : 'bg-[#28322A] text-[#C9C4B5] border border-[#3A483D]'
                }`}
              >
                {hasOpeningBalance ? 'Sincronizado' : 'Estimado do Extrato'}
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="font-receipt-mono text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#FAF8F2]">
                {formatCurrency(displayBalance)}
              </span>
            </div>

            {/* Consolidated Wealth Strip */}
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1B231D] border border-[#2D3930] text-[#D8D4C5]">
                <span className="text-[#8E9B90]">Patrimônio Total:</span>
                <span className="font-receipt-mono font-bold text-[#FAF8F2]">
                  {formatCurrency(totalConsolidatedWealth)}
                </span>
              </div>

              {totalAccumulatedReserves > 0 && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1F6672]/20 border border-[#1F6672]/40 text-[#71C4D1]">
                  <TrendingUp size={12} />
                  <span>Em Caixinhas/RDB:</span>
                  <span className="font-receipt-mono font-bold">
                    {formatCurrency(totalAccumulatedReserves)}
                  </span>
                </div>
              )}
            </div>

            <p className="text-xs text-[#A39E8E] mt-2 flex items-center gap-1.5">
              <Calendar size={13} />
              <span>
                {selectedMonth === 'all'
                  ? 'Todo o histórico de extratos'
                  : `Referência: ${selectedMonth.split('-')[1]}/${selectedMonth.split('-')[0]}`}
              </span>
              {transactions.length > 0 && (
                <span className="text-[#C9C4B5]">({transactions.length} lançamentos)</span>
              )}
            </p>
          </div>

          {/* Quick Flow Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#2A332B]">
            {/* Real Income */}
            <div className="bg-[#1D251F] p-3 rounded-xl border border-[#2E3A30]">
              <div className="flex items-center justify-between text-xs text-[#2E6B4F] font-semibold">
                <span className="flex items-center gap-1">
                  <ArrowDownLeft size={14} />
                  <span>Receitas</span>
                </span>
                <span className="text-[10px] text-[#8E9B90]" title="Apenas receitas reais, excluindo resgates de reserva">
                  Reais
                </span>
              </div>
              <div className="font-receipt-mono text-sm sm:text-base font-bold text-[#E5E2D5] mt-0.5">
                +{formatCurrency(totalIncomes)}
              </div>
              <span className="text-[10px] text-[#8E9B90] block mt-0.5">Salários & Pix recebidos</span>
            </div>

            {/* Expenses */}
            <div className="bg-[#1D251F] p-3 rounded-xl border border-[#2E3A30]">
              <div className="flex items-center justify-between text-xs text-[#C84B31] font-semibold">
                <span className="flex items-center gap-1">
                  <ArrowUpRight size={14} />
                  <span>Saídas</span>
                </span>
                <span className="text-[10px] text-[#8E9B90]">Gastos</span>
              </div>
              <div className="font-receipt-mono text-sm sm:text-base font-bold text-[#E5E2D5] mt-0.5">
                -{formatCurrency(totalExpenses)}
              </div>
              <span className="text-[10px] text-[#8E9B90] block mt-0.5">Despesas e consumo</span>
            </div>

            {/* Net Investment Movement */}
            <div className="col-span-2 sm:col-span-1 bg-[#1D251F] p-3 rounded-xl border border-[#2E3A30]">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className={`flex items-center gap-1 ${netInvested >= 0 ? 'text-[#1F6672]' : 'text-[#B96A28]'}`}>
                  <TrendingUp size={14} />
                  <span>{netInvested >= 0 ? 'Aporte Líquido' : 'Uso de Reserva'}</span>
                </span>
              </div>
              <div className="font-receipt-mono text-sm sm:text-base font-bold text-[#E5E2D5] mt-0.5">
                {netInvested >= 0 ? `+${formatCurrency(netInvested)}` : `-${formatCurrency(Math.abs(netInvested))}`}
              </div>
              <span className="text-[10px] text-[#8E9B90] block mt-0.5">
                {redeemedInvestments > 0
                  ? `+${formatCurrency(appliedInvestments)} / -${formatCurrency(redeemedInvestments)} resgatados`
                  : 'Guardado em caixinhas'}
              </span>
            </div>
          </div>
        </div>

        {/* Diagnosis Strip: Savings Rate / Reserve Usage */}
        {(totalIncomes > 0 || redeemedInvestments > 0) && (
          <div className="mt-3.5 pt-3 border-t border-[#263128] flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              {netInvested > 0 && totalIncomes > 0 ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#2E6B4F]/20 text-[#A7D7BC] border border-[#2E6B4F]/40 font-medium">
                  <span>🎯 Taxa de Poupança:</span>
                  <span className="font-bold font-mono">{formatPercent(savingsRate)}</span>
                  <span className="text-[#8E9B90]">da renda guardada neste período</span>
                </div>
              ) : netInvested < 0 ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#B96A28]/20 text-[#E0B589] border border-[#B96A28]/40 font-medium">
                  <span>🛡️ Uso de Reserva:</span>
                  <span className="font-bold font-mono">{formatCurrency(Math.abs(netInvested))}</span>
                  <span className="text-[#A39E8E]">resgatados da caixinha (não inflou receitas)</span>
                </div>
              ) : null}

              {redeemedInvestments > 0 && netInvested >= 0 && (
                <span className="text-[11px] text-[#A39E8E] hidden sm:inline">
                  ℹ️ R$ {formatCurrency(redeemedInvestments)} resgatados caíram na conta sem inflar seus ganhos.
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action button bar inside hero */}
        <div className="mt-3 pt-3 border-t border-[#263128] flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenFocusMode}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2E6B4F] hover:bg-[#255740] text-[#FAF8F2] font-semibold transition-colors cursor-pointer border border-[#3E8061]"
            >
              <Sparkles size={13} className="text-[#A7D7BC]" />
              <span>Modo Especial & Resumos</span>
            </button>

            <button
              type="button"
              onClick={onOpenSettingsModal}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#222A23] hover:bg-[#2C362E] text-[#D8D4C5] border border-[#344036] transition-colors cursor-pointer"
            >
              <SlidersHorizontal size={13} />
              <span>{hasOpeningBalance ? 'Ajustar Saldo' : 'Saldo Inicial'}</span>
            </button>
            {transactions.length === 0 && (
              <button
                type="button"
                onClick={onLoadSample}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#222A23] hover:bg-[#2C362E] text-[#B96A28] border border-[#344036] transition-colors cursor-pointer"
              >
                <Sparkles size={13} />
                <span>Exemplo</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onOpenImportModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF8F2] hover:bg-[#EAE6D9] text-[#141A15] font-semibold transition-colors cursor-pointer"
          >
            <UploadCloud size={14} />
            <span>Novo Extrato CSV</span>
          </button>
        </div>
      </div>

      {/* Special Distraction-free Focus Mode Interactive Card */}
      <div className="bg-[#FAF8F2] border border-[#D8D0BE] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-[#161C17] text-[#8FB397] shrink-0 mt-0.5">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-receipt-display font-bold text-sm sm:text-base text-[#141A15]">
                Modo Especial Sem Distrações
              </span>
              <span className="text-[10px] font-mono uppercase bg-[#2E6B4F]/15 text-[#2E6B4F] px-2 py-0.5 rounded-full font-bold">
                Novo
              </span>
            </div>
            <p className="text-xs text-[#555C54] mt-0.5 max-w-xl">
              Saudação personalizada, tela cheia com zero distrações e resumos diário, semanal e mensal de fácil leitura.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenFocusMode}
          className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#161C17] hover:bg-[#253027] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
        >
          <span>Abrir Modo Especial</span>
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Month Filter Selector */}
      <MonthSelector
        transactions={transactions}
        selectedMonth={selectedMonth}
        onSelectMonth={onSelectMonth}
      />

      {/* 4 Essential Summary Cards */}
      <StatCarousel
        transactions={transactions}
        selectedMonth={selectedMonth}
      />

      {/* Two-Column Grid: Resumo do Dia & Acesso Rápido a Categorias */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 items-start">
        {/* Resumo do Dia */}
        <DaySummary
          transactions={transactions}
          onOpenCategorySheet={onOpenCategorySheet}
        />

        {/* Quick Nav Card to Categorias & Investimentos */}
        <div className="bg-[#FAF8F2] border border-[#D8D2C0] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#EAE4D2]">
              <div className="flex items-center gap-2">
                <PieChart size={18} className="text-[#141A15]" />
                <h3 className="font-receipt-display font-bold text-base text-[#141A15]">
                  Visão de Gastos & Metas
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onSelectTab('categories')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#1F6672] hover:underline cursor-pointer"
              >
                <span>Ver completo</span>
                <ChevronRight size={14} />
              </button>
            </div>
            <p className="text-xs text-[#555C54] mb-3">
              Monitore a divisão de gastos em 10 categorias essenciais, incluindo as novas categorias <strong>Moradia</strong> e <strong>Educação</strong>.
            </p>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => onSelectTab('categories')}
                className="flex flex-col p-3 rounded-xl bg-[#F0EDE1] hover:bg-[#E5E0D0] border border-[#DCD6C4] text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between w-full">
                  <PieChart size={16} className="text-[#1F6672]" />
                  <ChevronRight size={14} className="text-[#888E84] group-hover:translate-x-0.5 transition-transform" />
                </div>
                <span className="font-semibold text-xs text-[#141A15] mt-2">Gastos por Categoria</span>
                <span className="text-[11px] text-[#636A60]">Alimentação, Moradia, Educação...</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('investments')}
                className="flex flex-col p-3 rounded-xl bg-[#F0EDE1] hover:bg-[#E5E0D0] border border-[#DCD6C4] text-left transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between w-full">
                  <TrendingUp size={16} className="text-[#B96A28]" />
                  <ChevronRight size={14} className="text-[#888E84] group-hover:translate-x-0.5 transition-transform" />
                </div>
                <span className="font-semibold text-xs text-[#141A15] mt-2">Painel de Investimentos</span>
                <span className="text-[11px] text-[#636A60]">Aplicações e Resgates RDB</span>
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#EAE4D2] flex items-center justify-between text-xs text-[#636A60]">
            <span>1-Clique para reclassificar lançamentos</span>
            <button
              type="button"
              onClick={() => onSelectTab('menu')}
              className="text-[#141A15] font-semibold hover:underline cursor-pointer"
            >
              Gerenciar Regras →
            </button>
          </div>
        </div>
      </div>

      {/* Recent Transactions Preview Section (Direct & Clean) */}
      <div className="bg-[#FAF8F2] border border-[#D8D2C0] rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#EAE4D2]">
          <div className="flex items-center gap-2">
            <ReceiptText size={18} className="text-[#141A15]" />
            <h3 className="font-receipt-display font-bold text-base text-[#141A15]">
              Últimos Lançamentos
            </h3>
            <span className="text-[11px] font-mono px-2 py-0.2 rounded bg-[#EDE8DC] text-[#555C54] border border-[#DCD6C4]">
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
                      <span className="truncate max-w-[200px]">{txn.desc}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    <CategoryChip
                      category={txn.category}
                      source={txn.categorySource}
                      onClick={() => onOpenCategorySheet(txn)}
                      showSource={false}
                    />

                    <div
                      className={`font-receipt-mono font-bold text-xs sm:text-sm text-right min-w-[85px] ${
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

        <div className="mt-3 pt-3 border-t border-[#EAE4D2] text-center">
          <button
            type="button"
            onClick={() => onSelectTab('statement')}
            className="w-full py-2.5 rounded-xl bg-[#EDE8DC] hover:bg-[#E2DDCB] text-xs font-bold text-[#141A15] border border-[#D8D2C0] transition-colors cursor-pointer"
          >
            Acessar Extrato Completo com Filtros e Busca ({filteredTxns.length} lançamentos)
          </button>
        </div>
      </div>
    </div>
  );
};
