/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Category, CategoryRule, ParseResult, Settings, Transaction } from './types';
import { parseNubankCSV } from './lib/csv/parseStatement';
import {
  loadTransactions,
  saveTransactions,
  loadRules,
  saveRules,
  loadSettings,
  saveSettings,
  clearAllData,
} from './lib/storage/localStorage';
import { SAMPLE_NUBANK_CSV } from './data/sampleData';
import { CATEGORIES } from './lib/categorization/categories';

// Navigation & Views
import { Navigation, TabType } from './components/Navigation';
import { HomeView } from './components/views/HomeView';
import { StatementView } from './components/views/StatementView';
import { CategoriesView } from './components/views/CategoriesView';
import { InvestmentsView } from './components/views/InvestmentsView';
import { ManageMenuView } from './components/views/ManageMenuView';

// Modals & Floating Components
import { CategorySheet } from './components/CategorySheet';
import { ImportModal } from './components/ImportModal';
import { SettingsModal } from './components/SettingsModal';
import { FocusModeView } from './components/FocusModeView';
import { ToastNotification, ToastData } from './components/ToastNotification';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [rules, setRules] = useState<Record<string, CategoryRule>>({});
  const [settings, setSettings] = useState<Settings>({ openingBalance: null, openingBalanceDate: null });
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');

  // Modals & Sheets
  const [activeSheetTxn, setActiveSheetTxn] = useState<Transaction | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [isFocusModeOpen, setIsFocusModeOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastData | null>(null);

  // Initialize data on mount
  useEffect(() => {
    const savedTxns = loadTransactions();
    const savedRules = loadRules();
    const savedSettings = loadSettings();

    setRules(savedRules);
    setSettings(savedSettings);

    if (savedTxns.length > 0) {
      setTransactions(savedTxns);
    } else {
      // Zero-friction initial experience: load realistic sample data immediately
      const result = parseNubankCSV(SAMPLE_NUBANK_CSV, [], savedRules);
      setTransactions(result.transactions);
      saveTransactions(result.transactions);
    }

    // Global keyboard shortcut: press 'f' or 'z' to toggle special focus mode
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        return;
      }
      if (e.key.toLowerCase() === 'f' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        setIsFocusModeOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Sync state to localStorage whenever transactions or rules change
  const updateTransactions = useCallback((newTxns: Transaction[]) => {
    setTransactions(newTxns);
    saveTransactions(newTxns);
  }, []);

  const updateRules = useCallback((newRules: Record<string, CategoryRule>) => {
    setRules(newRules);
    saveRules(newRules);
  }, []);

  const updateSettings = useCallback((newSettings: Settings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  }, []);

  // Handle CSV Import
  const handleImportCSV = useCallback(
    (csvContent: string): ParseResult => {
      const result = parseNubankCSV(csvContent, transactions, rules);
      if (result.newCount > 0) {
        updateTransactions(result.transactions);

        // Confetti celebration
        try {
          confetti({
            particleCount: 45,
            spread: 60,
            origin: { y: 0.8 },
            colors: ['#2E6B4F', '#1F6672', '#B96A28', '#141A15'],
          });
        } catch (_) {
          // ignore
        }

        setToast({
          id: String(Date.now()),
          message: `${result.newCount} novas transações importadas com sucesso!`,
          type: 'success',
        });
      } else if (result.duplicateCount > 0) {
        setToast({
          id: String(Date.now()),
          message: `${result.duplicateCount} transações já estavam cadastradas (sem duplicatas).`,
          type: 'info',
        });
      }
      return result;
    },
    [transactions, rules, updateTransactions]
  );

  // Handle Loading Sample Data
  const handleLoadSample = useCallback(() => {
    const result = parseNubankCSV(SAMPLE_NUBANK_CSV, transactions, rules);
    updateTransactions(result.transactions);
    setToast({
      id: String(Date.now()),
      message: 'Extrato de exemplo do Nubank carregado!',
      type: 'success',
    });
  }, [transactions, rules, updateTransactions]);

  // Handle 1-Click Recursive Categorization
  const handleSelectCategory = useCallback(
    (newCategory: Category, merchantKey: string) => {
      const now = new Date().toISOString();

      // 1. Update rule
      const updatedRules = {
        ...rules,
        [merchantKey]: {
          merchantKey,
          category: newCategory,
          updatedAt: now,
        },
      };
      updateRules(updatedRules);

      // 2. Recursively update all existing transactions with this merchantKey
      let affectedCount = 0;
      const updatedTxns = transactions.map((t) => {
        if (t.merchantKey === merchantKey) {
          affectedCount++;
          return {
            ...t,
            category: newCategory,
            categorySource: 'manual' as const,
          };
        }
        return t;
      });

      updateTransactions(updatedTxns);
      setActiveSheetTxn(null);

      // 3. Show confirmation toast
      const catLabel = CATEGORIES[newCategory]?.label || newCategory;
      setToast({
        id: String(Date.now()),
        message: `Categoria "${catLabel}" aplicada a ${affectedCount} ${
          affectedCount === 1 ? 'lançamento' : 'lançamentos'
        } de ${merchantKey}`,
        merchantKey,
        count: affectedCount,
      });
    },
    [rules, transactions, updateRules, updateTransactions]
  );

  // Handle Delete Rule
  const handleDeleteRule = useCallback(
    (merchantKey: string) => {
      const updatedRules = { ...rules };
      delete updatedRules[merchantKey];
      updateRules(updatedRules);
      setToast({
        id: String(Date.now()),
        message: `Regra de categorização para "${merchantKey}" removida.`,
        type: 'info',
      });
    },
    [rules, updateRules]
  );

  // Handle Update Rule Category
  const handleUpdateRuleCategory = useCallback(
    (merchantKey: string, newCategory: Category) => {
      handleSelectCategory(newCategory, merchantKey);
    },
    [handleSelectCategory]
  );

  // Count how many transactions would be affected by reclassifying the currently open merchant
  const affectedCountForActiveTxn = useMemo(() => {
    if (!activeSheetTxn) return 0;
    return transactions.filter((t) => t.merchantKey === activeSheetTxn.merchantKey).length;
  }, [activeSheetTxn, transactions]);

  // Clear data
  const handleClearAll = useCallback(() => {
    clearAllData();
    setTransactions([]);
    setRules({});
    setSettings({ openingBalance: null, openingBalanceDate: null });
    setToast({
      id: String(Date.now()),
      message: 'Todos os dados locais foram limpos.',
      type: 'info',
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#EDE8DC] text-[#141A15] flex flex-col font-sans selection:bg-[#D3CCA]">
      {/* Top Header & Navigation */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        transactionCount={transactions.length}
        rulesCount={Object.keys(rules).length}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onOpenFocusMode={() => setIsFocusModeOpen(true)}
      />

      {/* Main Container View (with padding bottom for mobile bar) */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-3.5 py-4 sm:px-6 sm:py-6 pb-20 md:pb-8">
        {activeTab === 'home' && (
          <HomeView
            transactions={transactions}
            settings={settings}
            selectedMonth={selectedMonth}
            onSelectMonth={setSelectedMonth}
            onSelectTab={setActiveTab}
            onOpenCategorySheet={(txn) => setActiveSheetTxn(txn)}
            onOpenImportModal={() => setIsImportModalOpen(true)}
            onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
            onLoadSample={handleLoadSample}
            onOpenFocusMode={() => setIsFocusModeOpen(true)}
            onSelectCategory={setSelectedCategory}
          />
        )}

        {activeTab === 'statement' && (
          <StatementView
            transactions={transactions}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            selectedMonth={selectedMonth}
            onSelectMonth={setSelectedMonth}
            onOpenCategorySheet={(txn) => setActiveSheetTxn(txn)}
          />
        )}

        {activeTab === 'categories' && (
          <CategoriesView
            transactions={transactions}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            selectedMonth={selectedMonth}
            onSelectMonth={setSelectedMonth}
            onOpenCategorySheet={(txn) => setActiveSheetTxn(txn)}
          />
        )}

        {activeTab === 'investments' && (
          <InvestmentsView
            transactions={transactions}
            selectedMonth={selectedMonth}
            onSelectMonth={setSelectedMonth}
            onOpenCategorySheet={(txn) => setActiveSheetTxn(txn)}
          />
        )}

        {activeTab === 'menu' && (
          <ManageMenuView
            transactions={transactions}
            rules={rules}
            settings={settings}
            onImportCSV={handleImportCSV}
            onSaveSettings={updateSettings}
            onDeleteRule={handleDeleteRule}
            onUpdateRuleCategory={handleUpdateRuleCategory}
            onLoadSample={handleLoadSample}
            onClearAllData={handleClearAll}
          />
        )}
      </main>

      {/* Special Distraction-free Focus & Summary Mode (Fullscreen overlay) */}
      <FocusModeView
        isOpen={isFocusModeOpen}
        onClose={() => setIsFocusModeOpen(false)}
        transactions={transactions}
        settings={settings}
        selectedMonth={selectedMonth}
      />

      {/* Category Adjustment Sheet (Bottom sheet mobile / modal desktop) */}
      <CategorySheet
        isOpen={Boolean(activeSheetTxn)}
        transaction={activeSheetTxn}
        affectedCount={affectedCountForActiveTxn}
        onClose={() => setActiveSheetTxn(null)}
        onSelectCategory={handleSelectCategory}
      />

      {/* Quick Import Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportCSV={handleImportCSV}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        settings={settings}
        onClose={() => setIsSettingsModalOpen(false)}
        onSaveSettings={updateSettings}
        onClearAllData={handleClearAll}
      />

      {/* Toast Notification */}
      <ToastNotification
        toast={toast}
        onClose={() => setToast(null)}
      />
    </div>
  );
}
