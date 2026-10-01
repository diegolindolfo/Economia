import Papa from 'papaparse';
import { CategoryRule, ParseResult, Transaction } from '../../types';
import { extractMerchantKey } from '../categorization/merchantKey';
import { determineCategory } from '../categorization/rules';
import { isValidISODate, parseLocalizedAmount } from '../format';

const DATE_HEADERS = ['data', 'date', 'dt'];
const AMOUNT_HEADERS = ['valor', 'value', 'amount'];
const ID_HEADERS = ['identificador', 'id', 'uuid', 'identificacao'];
const DESCRIPTION_HEADERS = ['descricao', 'description', 'desc', 'historico', 'detalhes'];

/** Parses a Nubank CSV statement and merges valid, previously unseen transactions. */
export function parseNubankCSV(
  csvContent: string,
  existingTransactions: Transaction[] = [],
  savedRules: Record<string, CategoryRule> = {}
): ParseResult {
  const errors: string[] = [];
  const existingMap = new Map<string, Transaction>();
  const existingFallbackIds = new Set<string>();

  existingTransactions.forEach((transaction) => {
    existingMap.set(transaction.id, transaction);
    existingFallbackIds.add(fallbackTransactionId(transaction.date, transaction.valor, transaction.desc));
  });

  if (!csvContent || !csvContent.trim()) {
    return {
      transactions: existingTransactions,
      totalParsed: 0,
      newCount: 0,
      duplicateCount: 0,
      errors: ['Arquivo CSV vazio.'],
    };
  }

  const parsed = Papa.parse<Record<string, string>>(csvContent, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (header) => header.replace(/^\uFEFF/, '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
  });

  parsed.errors.slice(0, 3).forEach((error) => {
    addError(errors, `Linha ${error.row ?? '?'}: ${error.message}`);
  });

  const headers = parsed.meta.fields ?? [];
  if (!hasAny(headers, DATE_HEADERS)) addError(errors, 'Coluna de data não encontrada (ex.: Data).');
  if (!hasAny(headers, AMOUNT_HEADERS)) addError(errors, 'Coluna de valor não encontrada (ex.: Valor).');
  if (errors.length > 0 && (!hasAny(headers, DATE_HEADERS) || !hasAny(headers, AMOUNT_HEADERS))) {
    return { transactions: existingTransactions, totalParsed: 0, newCount: 0, duplicateCount: 0, errors };
  }

  let totalParsed = 0;
  let newCount = 0;
  let duplicateCount = 0;

  parsed.data.forEach((row, index) => {
    if (!row || typeof row !== 'object') return;

    const rawDate = firstValue(row, DATE_HEADERS);
    const rawAmount = firstValue(row, AMOUNT_HEADERS);
    const rawId = firstValue(row, ID_HEADERS);
    const rawDescription = firstValue(row, DESCRIPTION_HEADERS);
    if (!rawDate && !rawAmount && !rawId && !rawDescription) return;

    const line = index + 2;
    if (!rawDate || !rawAmount) {
      addError(errors, `Linha ${line}: data e valor são obrigatórios.`);
      return;
    }

    const amount = parseLocalizedAmount(rawAmount);
    if (amount === null) {
      addError(errors, `Linha ${line}: valor inválido ("${rawAmount}").`);
      return;
    }

    const dateFormatted = parseDateToISO(rawDate);
    if (!dateFormatted) {
      addError(errors, `Linha ${line}: data inválida ("${rawDate}").`);
      return;
    }

    totalParsed++;
    const description = rawDescription.trim();
    const nubankId = rawId.trim();
    const fallbackId = fallbackTransactionId(dateFormatted.iso, amount, description);
    const id = nubankId || fallbackId;
    if (existingMap.has(id) || (!nubankId && existingFallbackIds.has(fallbackId))) {
      duplicateCount++;
      return;
    }

    const { merchantKey, displayName } = extractMerchantKey(description);
    const { category, source } = determineCategory(merchantKey, description, amount, savedRules);
    const transaction: Transaction = {
      id,
      date: dateFormatted.iso,
      dateBR: dateFormatted.br,
      valor: amount,
      desc: description,
      merchantKey,
      displayName,
      category,
      categorySource: source,
    };

    existingMap.set(id, transaction);
    existingFallbackIds.add(fallbackId);
    newCount++;
  });

  const transactions = Array.from(existingMap.values()).sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date);
    return b.valor - a.valor;
  });

  if (totalParsed === 0 && errors.length === 0) {
    addError(errors, 'Nenhum lançamento válido foi encontrado no CSV.');
  }

  return { transactions, totalParsed, newCount, duplicateCount, errors };
}

function parseDateToISO(dateStr: string): { iso: string; br: string } | null {
  const trimmed = dateStr.trim();
  const ddmmyyyy = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (ddmmyyyy) {
    const day = ddmmyyyy[1].padStart(2, '0');
    const month = ddmmyyyy[2].padStart(2, '0');
    const year = ddmmyyyy[3];
    const iso = `${year}-${month}-${day}`;
    return isValidISODate(iso) ? { iso, br: `${day}/${month}/${year}` } : null;
  }

  const yyyymmdd = trimmed.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
  if (yyyymmdd) {
    const year = yyyymmdd[1];
    const month = yyyymmdd[2].padStart(2, '0');
    const day = yyyymmdd[3].padStart(2, '0');
    const iso = `${year}-${month}-${day}`;
    return isValidISODate(iso) ? { iso, br: `${day}/${month}/${year}` } : null;
  }

  return null;
}

function fallbackTransactionId(date: string, amount: number, description: string): string {
  // Hash the full description so distinct merchants with the same first 20 chars stay distinct.
  let first = 0x811c9dc5;
  let second = 0x9e3779b9;
  for (let index = 0; index < description.length; index++) {
    const code = description.charCodeAt(index);
    first = Math.imul(first ^ code, 0x01000193);
    second = Math.imul(second ^ code, 0x85ebca6b);
  }
  const hash = `${(first >>> 0).toString(16).padStart(8, '0')}${(second >>> 0).toString(16).padStart(8, '0')}`;
  return `txn-${date}-${amount.toFixed(2)}-${hash}`;
}

function firstValue(row: Record<string, string>, headers: string[]): string {
  for (const header of headers) {
    const value = row[header];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function hasAny(values: string[], candidates: string[]): boolean {
  return candidates.some((candidate) => values.includes(candidate));
}

function addError(errors: string[], message: string): void {
  if (errors.length < 10) errors.push(message);
}
