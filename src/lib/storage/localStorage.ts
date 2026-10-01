import { CategoryRule, Settings, Transaction } from '../../types';

const STORAGE_KEYS = {
  TRANSACTIONS: 'nufin:transactions',
  RULES: 'nufin:rules',
  SETTINGS: 'nufin:settings',
  SCHEMA_VERSION: 'nufin:schemaVersion',
};

const CURRENT_SCHEMA_VERSION = 1;

export function loadTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error loading transactions from localStorage:', err);
    return [];
  }
}

export function saveTransactions(transactions: Transaction[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    localStorage.setItem(STORAGE_KEYS.SCHEMA_VERSION, String(CURRENT_SCHEMA_VERSION));
  } catch (err) {
    console.error('Error saving transactions to localStorage:', err);
  }
}

export function loadRules(): Record<string, CategoryRule> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RULES);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch (err) {
    console.error('Error loading rules from localStorage:', err);
    return {};
  }
}

export function saveRules(rules: Record<string, CategoryRule>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(rules));
  } catch (err) {
    console.error('Error saving rules to localStorage:', err);
  }
}

export function loadSettings(): Settings {
  const defaultSettings: Settings = {
    openingBalance: null,
    openingBalanceDate: null,
  };
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return defaultSettings;
    const parsed = JSON.parse(raw);
    return { ...defaultSettings, ...parsed };
  } catch (err) {
    console.error('Error loading settings from localStorage:', err);
    return defaultSettings;
  }
}

export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Error saving settings to localStorage:', err);
  }
}

export function clearAllData(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.RULES);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  } catch (err) {
    console.error('Error clearing data from localStorage:', err);
  }
}
