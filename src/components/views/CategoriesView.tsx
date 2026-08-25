import React from 'react';
import { Category, Transaction } from '../../types';
import { MonthSelector } from '../MonthSelector';
import { CategoryBreakdown } from '../CategoryBreakdown';

interface CategoriesViewProps {
  transactions: Transaction[];
  selectedCategory: Category | 'all';
  onSelectCategory: (category: Category | 'all') => void;
  selectedMonth: string;
  onSelectMonth: (month: string) => void;
  onOpenCategorySheet: (txn: Transaction) => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  transactions,
  selectedCategory,
  onSelectCategory,
  selectedMonth,
  onSelectMonth,
}) => {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Month Selector */}
      <MonthSelector
        transactions={transactions}
        selectedMonth={selectedMonth}
        onSelectMonth={onSelectMonth}
      />

      {/* Category Breakdown Full Card */}
      <CategoryBreakdown
        transactions={transactions}
        selectedCategory={selectedCategory}
        onSelectCategory={onSelectCategory}
        selectedMonth={selectedMonth}
      />
    </div>
  );
};
