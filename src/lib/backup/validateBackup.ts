import { CategoryRule, CategorySource, Settings, Transaction } from '../../types';
import { extractMerchantKey } from '../categorization/merchantKey';
import { CATEGORIES } from '../categorization/categories';
import { formatDateBR, isValidISODate } from '../format';

export interface ValidatedBackup {
  transactions: Transaction[];
  rules: Record<string, CategoryRule>;
  settings: Settings;
  exportedAt?: string;
}

export interface BackupValidationResult {
  data: ValidatedBackup | null;
  errors: string[];
}

const DEFAULT_SETTINGS: Settings = { openingBalance: null, openingBalanceDate: null };
const CATEGORY_SOURCES = new Set(['regra', 'heuristica', 'manual']);

/** Validates app backups and legacy transaction arrays before restoring them. */
export function validateBackupPayload(value: unknown): BackupValidationResult {
  const errors: string[] = [];
  let rawTransactions: unknown[] = [];
  let rawRules: Record<string, unknown> = {};
  let rawSettings: unknown = DEFAULT_SETTINGS;
  let exportedAt: string | undefined;

  if (Array.isArray(value)) {
    rawTransactions = value;
  } else if (isRecord(value)) {
    if (value.transactions !== undefined) {
      if (Array.isArray(value.transactions)) rawTransactions = value.transactions;
      else errors.push('O campo "transactions" precisa ser uma lista.');
    }
    if (value.rules !== undefined) {
      if (isRecord(value.rules)) rawRules = value.rules;
      else errors.push('O campo "rules" precisa ser um objeto.');
    }
    if (value.settings !== undefined) rawSettings = value.settings;
    if (value.exportedAt !== undefined) {
      if (typeof value.exportedAt === 'string') exportedAt = value.exportedAt;
      else errors.push('O campo "exportedAt" precisa ser um texto.');
    }
  } else {
    errors.push('O arquivo não contém um backup JSON reconhecido.');
  }

  const transactions: Transaction[] = [];
  const seenIds = new Set<string>();
  rawTransactions.forEach((item, index) => {
    const transaction = validateTransaction(item, index, errors);
    if (!transaction) return;
    if (seenIds.has(transaction.id)) {
      addError(errors, `Lançamento ${index + 1}: identificador duplicado (${transaction.id}).`);
      return;
    }
    seenIds.add(transaction.id);
    transactions.push(transaction);
  });

  const rules: Record<string, CategoryRule> = {};
  Object.entries(rawRules).forEach(([key, item]) => {
    if (!isRecord(item)) {
      addError(errors, `Regra "${key}": conteúdo inválido.`);
      return;
    }
    if (typeof item.category !== 'string' || !isCategory(item.category)) {
      addError(errors, `Regra "${key}": categoria inválida.`);
      return;
    }
    const merchantKey = typeof item.merchantKey === 'string' && item.merchantKey.trim()
      ? item.merchantKey.trim()
      : key;
    if (!merchantKey || typeof item.updatedAt !== 'string' || !item.updatedAt.trim()) {
      addError(errors, `Regra "${key}": estabelecimento ou data da regra inválidos.`);
      return;
    }
    rules[key] = { merchantKey, category: item.category, updatedAt: item.updatedAt };
  });

  const settings = validateSettings(rawSettings, errors);
  if (transactions.length === 0 && Object.keys(rules).length === 0) {
    addError(errors, 'O arquivo não contém lançamentos ou regras para restaurar.');
  }

  if (errors.length > 0) return { data: null, errors };
  return { data: { transactions, rules, settings, exportedAt }, errors: [] };
}

function validateTransaction(value: unknown, index: number, errors: string[]): Transaction | null {
  const label = `Lançamento ${index + 1}`;
  if (!isRecord(value)) {
    addError(errors, `${label}: registro inválido.`);
    return null;
  }

  const id = typeof value.id === 'string' ? value.id.trim() : '';
  const date = typeof value.date === 'string' ? value.date : '';
  const amount = value.valor;
  const desc = typeof value.desc === 'string' ? value.desc : null;
  const category = value.category;
  const categorySource = value.categorySource;
  if (!id || !isValidISODate(date) || typeof amount !== 'number' || !Number.isFinite(amount) || desc === null) {
    addError(errors, `${label}: identificador, data, valor ou descrição inválidos.`);
    return null;
  }
  if (typeof category !== 'string' || !isCategory(category)) {
    addError(errors, `${label}: categoria inválida.`);
    return null;
  }
  if (!isCategorySource(categorySource)) {
    addError(errors, `${label}: origem da categoria inválida.`);
    return null;
  }

  const extracted = extractMerchantKey(desc);
  const merchantKey = typeof value.merchantKey === 'string' && value.merchantKey.trim()
    ? value.merchantKey.trim()
    : extracted.merchantKey;
  const displayName = typeof value.displayName === 'string' && value.displayName.trim()
    ? value.displayName
    : extracted.displayName;
  const dateBR = typeof value.dateBR === 'string' && value.dateBR.trim()
    ? value.dateBR
    : formatDateBR(date);

  return {
    id,
    date,
    dateBR,
    valor: amount,
    desc,
    merchantKey,
    displayName,
    category,
    categorySource,
  };
}

function validateSettings(value: unknown, errors: string[]): Settings {
  if (!isRecord(value)) {
    addError(errors, 'As configurações do backup são inválidas.');
    return DEFAULT_SETTINGS;
  }

  const openingBalance = value.openingBalance ?? null;
  const openingBalanceDate = value.openingBalanceDate ?? null;
  if (openingBalance !== null && (typeof openingBalance !== 'number' || !Number.isFinite(openingBalance))) {
    addError(errors, 'O saldo inicial do backup precisa ser um número válido.');
  }
  if (openingBalanceDate !== null && (typeof openingBalanceDate !== 'string' || !isValidISODate(openingBalanceDate))) {
    addError(errors, 'A data do saldo inicial do backup é inválida.');
  }

  return {
    openingBalance: typeof openingBalance === 'number' && Number.isFinite(openingBalance) ? openingBalance : null,
    openingBalanceDate: typeof openingBalanceDate === 'string' && isValidISODate(openingBalanceDate)
      ? openingBalanceDate
      : null,
  };
}

function isCategory(value: string): value is keyof typeof CATEGORIES {
  return Object.prototype.hasOwnProperty.call(CATEGORIES, value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isCategorySource(value: unknown): value is CategorySource {
  return typeof value === 'string' && CATEGORY_SOURCES.has(value);
}

function addError(errors: string[], message: string): void {
  if (errors.length < 8) errors.push(message);
}
