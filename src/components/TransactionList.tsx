import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  ReceiptText,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Calculator,
  X,
  TrendingDown,
  TrendingUp,
  RotateCcw,
  Tag,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import { Category, Transaction } from '../types';
import { CATEGORY_LIST } from '../lib/categorization/categories';
import { formatCurrency, formatDateBR, getRelativeDayLabel } from '../lib/format';
import { CategoryChip } from './CategoryChip';

interface TransactionListProps {
  transactions: Transaction[];
  selectedCategory: Category | 'all';
  onSelectCategory: (cat: Category | 'all') => void;
  selectedMonth: string;
  onSelectMonth?: (m: string) => void;
  onOpenCategorySheet: (transaction: Transaction) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  selectedCategory,
  onSelectCategory,
  selectedMonth,
  onSelectMonth,
  onOpenCategorySheet,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [expandedTxnId, setExpandedTxnId] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Clear search on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && searchQuery) {
        setSearchQuery('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchQuery]);

  // Top 5 most frequent merchants in current month for 1-click filter
  const topMerchants = useMemo(() => {
    const counts = new Map<string, number>();
    const monthTxns =
      selectedMonth === 'all'
        ? transactions
        : transactions.filter((t) => t.date.startsWith(selectedMonth));

    monthTxns.forEach((t) => {
      if (t.displayName && t.displayName.trim().length > 1) {
        counts.set(t.displayName, (counts.get(t.displayName) || 0) + 1);
      }
    });

    return Array.from(counts.entries())
      .filter(([_, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  }, [transactions, selectedMonth]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((txn) => {
      // Month filter
      if (selectedMonth !== 'all' && !txn.date.startsWith(selectedMonth)) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && txn.category !== selectedCategory) {
        return false;
      }

      // Type filter
      if (typeFilter === 'income' && txn.valor <= 0) return false;
      if (typeFilter === 'expense' && txn.valor >= 0) return false;

      // Search query (matches description, merchantKey, displayName, date, amount)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const normalizedDesc = txn.desc.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const normalizedMerchant = txn.merchantKey.toLowerCase();
        const normalizedDisplay = (txn.displayName || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const dateStr = txn.dateBR;
        const valorStr = txn.valor.toString();

        return (
          normalizedDesc.includes(query) ||
          normalizedMerchant.includes(query) ||
          normalizedDisplay.includes(query) ||
          dateStr.includes(query) ||
          valorStr.includes(query)
        );
      }

      return true;
    });
  }, [transactions, selectedMonth, selectedCategory, typeFilter, searchQuery]);

  // Quick Sum & Statistics for the active filter
  const filterStats = useMemo(() => {
    let expenses = 0;
    let incomes = 0;
    let expenseCount = 0;
    let incomeCount = 0;

    filteredTransactions.forEach((t) => {
      if (t.valor < 0) {
        expenses += Math.abs(t.valor);
        expenseCount++;
      } else {
        incomes += t.valor;
        incomeCount++;
      }
    });

    const net = incomes - expenses;
    const avgExpense = expenseCount > 0 ? expenses / expenseCount : 0;

    // All-time calculation for this query when a specific month is selected
    let allTimeExpenses = 0;
    let allTimeCount = 0;
    if (searchQuery.trim() && selectedMonth !== 'all') {
      const q = searchQuery.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      transactions.forEach((t) => {
        const normDesc = t.desc.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const normMerchant = t.merchantKey.toLowerCase();
        const normDisplay = (t.displayName || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (normDesc.includes(q) || normMerchant.includes(q) || normDisplay.includes(q)) {
          if (t.valor < 0) {
            allTimeExpenses += Math.abs(t.valor);
            allTimeCount++;
          }
        }
      });
    }

    return {
      expenses,
      incomes,
      expenseCount,
      incomeCount,
      net,
      avgExpense,
      totalCount: filteredTransactions.length,
      allTimeExpenses,
      allTimeCount,
    };
  }, [filteredTransactions, transactions, searchQuery, selectedMonth]);

  // Group by Date for receipt-like layout
  const groupedByDate = useMemo(() => {
    const groups: { date: string; items: Transaction[]; totalDay: number }[] = [];
    const dateMap = new Map<string, Transaction[]>();

    filteredTransactions.forEach((txn) => {
      const current = dateMap.get(txn.date) || [];
      current.push(txn);
      dateMap.set(txn.date, current);
    });

    // Dates sorted descending
    const sortedDates = Array.from(dateMap.keys()).sort().reverse();
    sortedDates.forEach((d) => {
      const items = dateMap.get(d) || [];
      const totalDay = items.reduce((acc, curr) => acc + curr.valor, 0);
      groups.push({ date: d, items, totalDay });
    });

    return groups;
  }, [filteredTransactions]);

  const toggleExpand = (id: string) => {
    setExpandedTxnId((prev) => (prev === id ? null : id));
  };

  const handleFilterByName = (name: string) => {
    if (searchQuery.toLowerCase() === name.toLowerCase()) {
      setSearchQuery('');
    } else {
      setSearchQuery(name);
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }
  };

  return (
    <div className="w-full bg-[#FBF9F2] rounded-2xl border border-[#D6D0BC] shadow-xs overflow-hidden">
      {/* Header & Controls */}
      <div className="p-4 sm:p-5 border-b border-[#D6D0BC]/80 bg-[#F5F2E7]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#EAE6D9] text-[#1E241F] flex items-center justify-center border border-[#D6D0BC]">
              <ReceiptText size={16} />
            </div>
            <div>
              <h3 className="font-receipt-display text-base sm:text-lg font-bold text-[#1E241F] leading-tight">
                Extrato Detalhado
              </h3>
              <span className="text-xs text-[#63665C]">
                {filteredTransactions.length}{' '}
                {filteredTransactions.length === 1 ? 'lançamento encontrado' : 'lançamentos encontrados'}
                {searchQuery && ` para "${searchQuery}"`}
              </span>
            </div>
          </div>

          {/* Type filters (Todas, Entradas, Saídas) */}
          <div className="flex items-center gap-1 bg-[#EAE6D9] p-1 rounded-xl border border-[#D6D0BC] self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setTypeFilter('all')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                typeFilter === 'all'
                  ? 'bg-[#1E241F] text-[#FBF9F2] shadow-xs'
                  : 'text-[#63665C] hover:text-[#1E241F]'
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('expense')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                typeFilter === 'expense'
                  ? 'bg-[#AE3B2B] text-[#FBF9F2] shadow-xs'
                  : 'text-[#63665C] hover:text-[#1E241F]'
              }`}
            >
              Saídas
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('income')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                typeFilter === 'income'
                  ? 'bg-[#2E6B4F] text-[#FBF9F2] shadow-xs'
                  : 'text-[#63665C] hover:text-[#1E241F]'
              }`}
            >
              Entradas
            </button>
          </div>
        </div>

        {/* Search input with keyboard hint */}
        <div className="relative mb-2.5">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#63665C]"
          />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar loja, pessoa, Pix, valor... (ex: iFood, Uber)"
            className="w-full pl-9 pr-14 py-2 text-xs sm:text-sm bg-[#FBF9F2] border border-[#D6D0BC] rounded-xl text-[#1E241F] placeholder-[#63665C]/60 focus:outline-none focus:border-[#1E241F] focus:ring-1 focus:ring-[#1E241F]/30 transition-all"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#63665C] hover:text-[#AE3B2B] font-semibold cursor-pointer px-1.5 py-0.5 rounded bg-[#EAE6D9] border border-[#D6D0BC]"
              title="Limpar pesquisa (ESC)"
            >
              Limpar
            </button>
          ) : (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[#63665C]/60 pointer-events-none hidden sm:inline">
              clique no nome do gasto
            </span>
          )}
        </div>

        {/* Frequent Merchants Quick Filters (Chips de 1 clique) */}
        {topMerchants.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-xs">
            <span className="text-[11px] text-[#63665C] font-semibold shrink-0 mr-0.5">
              Mais frequentes:
            </span>
            {topMerchants.map(({ name, count }) => {
              const isActive = searchQuery.toLowerCase() === name.toLowerCase();
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => handleFilterByName(name)}
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-[#1E241F] text-[#FAF8F2] border-[#1E241F] shadow-xs'
                      : 'bg-[#EAE6D9]/70 hover:bg-[#EAE6D9] text-[#1E241F] border-[#D6D0BC]'
                  }`}
                  title={`Filtrar apenas ${name}`}
                >
                  <span>{name}</span>
                  <span
                    className={`text-[10px] font-mono px-1 rounded-full ${
                      isActive ? 'bg-[#38433A] text-white' : 'bg-[#D6D0BC] text-[#63665C]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Category Horizontal Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => onSelectCategory('all')}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer min-h-[30px] border ${
              selectedCategory === 'all'
                ? 'bg-[#1E241F] text-[#FBF9F2] border-[#1E241F] shadow-xs'
                : 'bg-[#FBF9F2] text-[#63665C] border-[#D6D0BC] hover:border-[#1E241F]/40'
            }`}
          >
            Todas as Categorias
          </button>

          {CATEGORY_LIST.map((c) => {
            const isSelected = selectedCategory === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelectCategory(isSelected ? 'all' : c.id)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer min-h-[30px] border flex items-center gap-1.5 ${
                  isSelected
                    ? 'border-[#1E241F] font-bold shadow-xs'
                    : 'border-[#D6D0BC] hover:border-[#1E241F]/40'
                }`}
                style={{
                  backgroundColor: isSelected ? c.bgColor : '#FBF9F2',
                  color: isSelected ? c.color : '#63665C',
                }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: c.color }}
                />
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>

        {/* SOMA RÁPIDA DO FILTRO (Quando há pesquisa ativa) */}
        {searchQuery.trim() !== '' && (
          <div className="mt-3 p-3.5 sm:p-4 rounded-xl bg-[#FAF8F2] border-2 border-[#1E241F]/20 shadow-xs relative overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
            {/* Header of Quick Sum Card */}
            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#D6D0BC]/80">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#1E241F] text-[#FAF8F2] flex items-center justify-center text-xs font-bold shadow-xs">
                  <Calculator size={14} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-[#1E241F]">Soma Rápida do Filtro:</span>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-[#EAE6D9] text-[#1E241F] border border-[#D6D0BC]">
                      "{searchQuery}"
                    </span>
                  </div>
                  <span className="text-[11px] text-[#63665C]">
                    {filterStats.totalCount}{' '}
                    {filterStats.totalCount === 1 ? 'lançamento encontrado' : 'lançamentos encontrados'}
                    {selectedMonth !== 'all'
                      ? ` em ${selectedMonth.split('-')[1]}/${selectedMonth.split('-')[0]}`
                      : ' em todo o extrato'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#63665C] hover:text-[#AE3B2B] bg-[#EAE6D9] hover:bg-[#EAE6D9]/80 rounded-lg border border-[#D6D0BC] transition-colors cursor-pointer"
                title="Limpar filtro (ESC)"
              >
                <X size={13} />
                <span>Limpar</span>
              </button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3">
              {/* Total Gastos */}
              <div className="p-2.5 rounded-xl bg-[#F5F2E7] border border-[#D6D0BC]">
                <span className="text-[10px] font-mono font-bold uppercase block text-[#AE3B2B]">
                  Total Gasto
                </span>
                <div className="font-receipt-mono text-lg sm:text-xl font-bold text-[#AE3B2B] mt-0.5">
                  {formatCurrency(filterStats.expenses)}
                </div>
                <span className="text-[10px] text-[#63665C]">
                  {filterStats.expenseCount} {filterStats.expenseCount === 1 ? 'saída' : 'saídas'}
                </span>
              </div>

              {/* Gasto Médio */}
              <div className="p-2.5 rounded-xl bg-[#F5F2E7] border border-[#D6D0BC]">
                <span className="text-[10px] font-mono font-bold uppercase block text-[#63665C]">
                  Ticket Médio
                </span>
                <div className="font-receipt-mono text-lg sm:text-xl font-bold text-[#1E241F] mt-0.5">
                  {filterStats.expenseCount > 0 ? formatCurrency(filterStats.avgExpense) : 'R$ 0,00'}
                </div>
                <span className="text-[10px] text-[#63665C]">por lançamento</span>
              </div>

              {/* Entradas / Reembolsos se houver */}
              {filterStats.incomes > 0 ? (
                <div className="p-2.5 rounded-xl bg-[#F5F2E7] border border-[#D6D0BC]">
                  <span className="text-[10px] font-mono font-bold uppercase block text-[#2E6B4F]">
                    Entradas / Estornos
                  </span>
                  <div className="font-receipt-mono text-lg sm:text-xl font-bold text-[#2E6B4F] mt-0.5">
                    +{formatCurrency(filterStats.incomes)}
                  </div>
                  <span className="text-[10px] text-[#63665C]">
                    {filterStats.incomeCount} {filterStats.incomeCount === 1 ? 'crédito' : 'créditos'}
                  </span>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-[#F5F2E7] border border-[#D6D0BC]">
                  <span className="text-[10px] font-mono font-bold uppercase block text-[#63665C]">
                    Lançamentos
                  </span>
                  <div className="font-receipt-mono text-lg sm:text-xl font-bold text-[#1E241F] mt-0.5">
                    {filterStats.totalCount}
                  </div>
                  <span className="text-[10px] text-[#63665C]">no filtro ativo</span>
                </div>
              )}

              {/* Saldo Líquido do Filtro */}
              <div className="p-2.5 rounded-xl bg-[#F5F2E7] border border-[#D6D0BC]">
                <span className="text-[10px] font-mono font-bold uppercase block text-[#63665C]">
                  Balanço Líquido
                </span>
                <div
                  className={`font-receipt-mono text-lg sm:text-xl font-bold mt-0.5 ${
                    filterStats.net >= 0 ? 'text-[#2E6B4F]' : 'text-[#AE3B2B]'
                  }`}
                >
                  {formatCurrency(filterStats.net, true)}
                </div>
                <span className="text-[10px] text-[#63665C]">deste estabelecimento</span>
              </div>
            </div>

            {/* Comparativo de Histórico Completo quando um mês específico está filtrado */}
            {selectedMonth !== 'all' && filterStats.allTimeCount > filterStats.expenseCount && onSelectMonth && (
              <div className="mt-2.5 pt-2.5 border-t border-[#D6D0BC]/60 flex flex-wrap items-center justify-between gap-2 text-xs text-[#63665C]">
                <span>
                  No extrato todo você já gastou <strong>{formatCurrency(filterStats.allTimeExpenses)}</strong> ({filterStats.allTimeCount} compras) com este termo.
                </span>
                <button
                  type="button"
                  onClick={() => onSelectMonth('all')}
                  className="text-[#1F6672] hover:underline font-semibold cursor-pointer shrink-0"
                >
                  Ver no extrato completo →
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Transactions List */}
      <div className="divide-y divide-[#D6D0BC]/50 max-h-[600px] overflow-y-auto">
        {groupedByDate.length === 0 ? (
          <div className="p-10 text-center text-[#63665C]">
            <ReceiptText size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm font-semibold text-[#1E241F]">Nenhum lançamento encontrado</p>
            <p className="text-xs mt-1">Tente ajustar a busca ou os filtros aplicados.</p>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mt-3 px-3 py-1.5 rounded-lg bg-[#EAE6D9] text-xs font-semibold text-[#1E241F] hover:bg-[#D6D0BC] border border-[#D6D0BC] cursor-pointer"
              >
                Limpar busca "{searchQuery}"
              </button>
            )}
          </div>
        ) : (
          groupedByDate.map((group) => (
            <div key={group.date} className="bg-[#FBF9F2]">
              {/* Group Date Header */}
              <div className="px-4 py-2 bg-[#F5F2E7] border-y border-[#D6D0BC]/50 flex items-center justify-between sticky top-0 z-10">
                <span className="text-xs font-bold text-[#1E241F] tracking-tight font-receipt-display">
                  {getRelativeDayLabel(group.date)}
                </span>
                <span className="text-[11px] font-mono text-[#63665C]">
                  {formatCurrency(group.totalDay, true)}
                </span>
              </div>

              {/* Items in Day */}
              <div className="divide-y divide-[#D6D0BC]/30">
                {group.items.map((txn) => {
                  const isIncome = txn.valor > 0;
                  const isExpanded = expandedTxnId === txn.id;
                  const isFiltered = searchQuery.toLowerCase() === (txn.displayName || '').toLowerCase();

                  return (
                    <div
                      key={txn.id}
                      className={`p-3 sm:px-4 sm:py-3 transition-colors ${
                        isFiltered ? 'bg-[#2E6B4F]/5' : 'hover:bg-[#F5F2E7]/70'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        {/* Left: Category chip button + Description */}
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <CategoryChip
                            category={txn.category}
                            source={txn.categorySource}
                            size="md"
                            interactive
                            showSourceDot
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenCategorySheet(txn);
                            }}
                          />

                          <div className="min-w-0 flex-1">
                            {/* Clickable Merchant / Expense Name */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleFilterByName(txn.displayName);
                                }}
                                className={`text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1 text-left cursor-pointer group rounded px-1 -mx-1 ${
                                  isFiltered
                                    ? 'text-[#2E6B4F] bg-[#2E6B4F]/10 font-bold'
                                    : 'text-[#1E241F] hover:text-[#2E6B4F] hover:bg-[#EAE6D9]/50'
                                }`}
                                title={`Clique para filtrar só gastos com "${txn.displayName}"`}
                              >
                                <span>{txn.displayName}</span>
                                <span className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity bg-[#2E6B4F]/10 text-[#2E6B4F] px-1 py-0.2 rounded font-mono font-normal flex items-center gap-0.5">
                                  <Search size={9} /> filtrar
                                </span>
                              </button>

                              {txn.categorySource === 'regra' && (
                                <span
                                  className="text-[9px] px-1 py-0.2 rounded bg-[#EAE6D9] text-[#63665C] border border-[#D6D0BC] font-mono shrink-0"
                                  title="Categorizado por regra aprendida"
                                >
                                  regra
                                </span>
                              )}
                            </div>

                            {/* Original Description (click to expand) */}
                            <div
                              className="text-[11px] text-[#63665C] truncate font-mono mt-0.5 cursor-pointer hover:text-[#1E241F]"
                              onClick={() => toggleExpand(txn.id)}
                              title="Clique para ver detalhes do lançamento"
                            >
                              {txn.desc}
                            </div>
                          </div>
                        </div>

                        {/* Right: Amount & expand toggle */}
                        <div className="shrink-0 text-right flex items-center gap-2">
                          <div>
                            <div
                              className={`font-receipt-mono text-sm sm:text-base font-bold ${
                                isIncome ? 'text-[#2E6B4F]' : 'text-[#1E241F]'
                              }`}
                            >
                              {formatCurrency(txn.valor, isIncome)}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => toggleExpand(txn.id)}
                            className="p-1 text-[#63665C] hover:text-[#1E241F] rounded cursor-pointer"
                            aria-label="Ver detalhes"
                          >
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Details Drawer */}
                      {isExpanded && (
                        <div className="mt-2.5 pt-2.5 border-t border-[#D6D0BC]/50 bg-[#EAE6D9]/40 p-2.5 rounded-lg text-xs space-y-1.5 animate-in fade-in duration-150">
                          <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] text-[#63665C]">
                            <span>
                              Identificador Nubank:{' '}
                              <code className="font-mono bg-[#FBF9F2] px-1 py-0.5 rounded text-[10px]">
                                {txn.id}
                              </code>
                            </span>
                            <span>
                              Data: <strong>{txn.dateBR}</strong> ({txn.date})
                            </span>
                          </div>

                          <div className="text-[11px] text-[#1E241F]">
                            <strong>Descrição Original:</strong> {txn.desc}
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#D6D0BC]/50">
                            <div className="text-[11px] text-[#63665C]">
                              Chave: <code className="font-mono">{txn.merchantKey}</code> ({txn.categorySource})
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <button
                                type="button"
                                onClick={() => handleFilterByName(txn.displayName)}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-[#2E6B4F] bg-[#FBF9F2] px-2.5 py-1 rounded border border-[#2E6B4F]/40 hover:bg-[#2E6B4F]/10 cursor-pointer"
                              >
                                <Search size={12} />
                                <span>Filtrar só {txn.displayName}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => onOpenCategorySheet(txn)}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-[#1E241F] bg-[#FBF9F2] px-2 py-1 rounded border border-[#D6D0BC] hover:bg-[#EAE6D9] cursor-pointer"
                              >
                                <Sparkles size={12} className="text-[#B96A28]" />
                                <span>Trocar categoria ({txn.merchantKey})</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
