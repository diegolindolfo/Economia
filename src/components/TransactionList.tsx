import React, { useState, useMemo } from 'react';
import { Search, Filter, ArrowUpDown, ReceiptText, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { Category, Transaction } from '../types';
import { CATEGORY_LIST } from '../lib/categorization/categories';
import { formatCurrency, formatDateBR, getRelativeDayLabel } from '../lib/format';
import { CategoryChip } from './CategoryChip';

interface TransactionListProps {
  transactions: Transaction[];
  selectedCategory: Category | 'all';
  onSelectCategory: (cat: Category | 'all') => void;
  selectedMonth: string;
  onOpenCategorySheet: (transaction: Transaction) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  selectedCategory,
  onSelectCategory,
  selectedMonth,
  onOpenCategorySheet,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [expandedTxnId, setExpandedTxnId] = useState<string | null>(null);

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

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const normalizedDesc = txn.desc.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const normalizedMerchant = txn.merchantKey.toLowerCase();
        const dateStr = txn.dateBR;
        const valorStr = txn.valor.toString();

        return (
          normalizedDesc.includes(query) ||
          normalizedMerchant.includes(query) ||
          dateStr.includes(query) ||
          valorStr.includes(query)
        );
      }

      return true;
    });
  }, [transactions, selectedMonth, selectedCategory, typeFilter, searchQuery]);

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
                {filteredTransactions.length} {filteredTransactions.length === 1 ? 'lançamento' : 'lançamentos'} encontrados
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

        {/* Search input */}
        <div className="relative mb-3">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#63665C]"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por loja, pessoa, Pix, valor ou data..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-[#FBF9F2] border border-[#D6D0BC] rounded-xl text-[#1E241F] placeholder-[#63665C]/60 focus:outline-none focus:border-[#1E241F] focus:ring-1 focus:ring-[#1E241F]/30 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#63665C] hover:text-[#1E241F] font-semibold cursor-pointer px-1 py-0.5"
            >
              Limpar
            </button>
          )}
        </div>

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
      </div>

      {/* Transactions List */}
      <div className="divide-y divide-[#D6D0BC]/50 max-h-[600px] overflow-y-auto">
        {groupedByDate.length === 0 ? (
          <div className="p-10 text-center text-[#63665C]">
            <ReceiptText size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm font-semibold text-[#1E241F]">Nenhum lançamento encontrado</p>
            <p className="text-xs mt-1">Tente ajustar a busca ou os filtros aplicados.</p>
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

                  return (
                    <div
                      key={txn.id}
                      className="p-3 sm:px-4 sm:py-3 hover:bg-[#F5F2E7]/70 transition-colors"
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

                          <div
                            className="min-w-0 flex-1 cursor-pointer"
                            onClick={() => toggleExpand(txn.id)}
                          >
                            <div className="text-xs sm:text-sm font-semibold text-[#1E241F] truncate flex items-center gap-1.5">
                              <span>{txn.displayName}</span>
                              {txn.categorySource === 'regra' && (
                                <span
                                  className="text-[9px] px-1 py-0.2 rounded bg-[#EAE6D9] text-[#63665C] border border-[#D6D0BC] font-mono shrink-0"
                                  title="Categorizado por regra aprendida"
                                >
                                  regra
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[#63665C] truncate font-mono mt-0.5">
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
                              Identificador Nubank: <code className="font-mono bg-[#FBF9F2] px-1 py-0.5 rounded text-[10px]">{txn.id}</code>
                            </span>
                            <span>Data: <strong>{txn.dateBR}</strong> ({txn.date})</span>
                          </div>

                          <div className="text-[11px] text-[#1E241F]">
                            <strong>Descrição Original:</strong> {txn.desc}
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <div className="text-[11px] text-[#63665C]">
                              Chave: <code className="font-mono">{txn.merchantKey}</code> ({txn.categorySource})
                            </div>
                            <button
                              type="button"
                              onClick={() => onOpenCategorySheet(txn)}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-[#1E241F] bg-[#FBF9F2] px-2 py-1 rounded border border-[#D6D0BC] hover:bg-[#EAE6D9] cursor-pointer"
                            >
                              <Sparkles size={12} className="text-[#B96A28]" />
                              <span>Trocar categoria de todos ({txn.merchantKey})</span>
                            </button>
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
