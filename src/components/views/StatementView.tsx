import React from 'react';
import { Transaction, Category } from '../../types';
import { MonthSelector } from '../MonthSelector';
import { TransactionList } from '../TransactionList';

interface StatementViewProps {
  transactions: Transaction[];
  selectedCategory: Category | 'all';
  onSelectCategory: (category: Category | 'all') => void;
  selectedMonth: string;
  onSelectMonth: (month: string) => void;
  onOpenCategorySheet: (txn: Transaction) => void;
}

export const StatementView: React.FC<StatementViewProps> = ({
  transactions,
  selectedCategory,
  onSelectCategory,
  selectedMonth,
  onSelectMonth,
  onOpenCategorySheet,
}) => {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Month Selector */}
      <MonthSelector
        transactions={transactions}
        selectedMonth={selectedMonth}
        onSelectMonth={onSelectMonth}
      />

      {/* Full Transaction List */}
      <TransactionList
        transactions={transactions}
        selectedCategory={selectedCategory}
        onSelectCategory={onSelectCategory}
        selectedMonth={selectedMonth}
        onOpenCategorySheet={onOpenCategorySheet}
      />
    </div>
  );
};
