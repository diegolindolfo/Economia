import React from 'react';
import { Transaction } from '../../types';
import { MonthSelector } from '../MonthSelector';
import { InvestmentsPanel } from '../InvestmentsPanel';

interface InvestmentsViewProps {
  transactions: Transaction[];
  selectedMonth: string;
  onSelectMonth: (month: string) => void;
  onOpenCategorySheet: (txn: Transaction) => void;
}

export const InvestmentsView: React.FC<InvestmentsViewProps> = ({
  transactions,
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

      {/* Investments Dedicated Panel */}
      <InvestmentsPanel
        transactions={transactions}
        selectedMonth={selectedMonth}
        onOpenCategorySheet={onOpenCategorySheet}
      />
    </div>
  );
};
