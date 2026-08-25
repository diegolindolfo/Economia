import Papa from 'papaparse';
import { CategoryRule, ParseResult, Transaction } from '../../types';
import { extractMerchantKey } from '../categorization/merchantKey';
import { determineCategory } from '../categorization/rules';

/**
 * Parses a Nubank CSV financial statement and merges it with existing transactions.
 */
export function parseNubankCSV(
  csvContent: string,
  existingTransactions: Transaction[] = [],
  savedRules: Record<string, CategoryRule> = {}
): ParseResult {
  const errors: string[] = [];
  const existingMap = new Map<string, Transaction>();
  
  existingTransactions.forEach((t) => {
    existingMap.set(t.id, t);
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

  // Parse CSV with PapaParse
  const parsed = Papa.parse<Record<string, string>>(csvContent, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (header) => header.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
  });

  if (parsed.errors && parsed.errors.length > 0) {
    parsed.errors.slice(0, 3).forEach((e) => {
      errors.push(`Linha ${e.row ?? '?'}: ${e.message}`);
    });
  }

  const rows = parsed.data;
  let totalParsed = 0;
  let newCount = 0;
  let duplicateCount = 0;

  const newTransactions: Transaction[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row || typeof row !== 'object') continue;

    // Find columns flexibly
    const rawDate = row['data'] || row['date'] || row['dt'] || '';
    const rawValor = row['valor'] || row['value'] || row['amount'] || '';
    const rawId = row['identificador'] || row['id'] || row['uuid'] || row['identificacao'] || '';
    const rawDesc = row['descricao'] || row['description'] || row['desc'] || row['historico'] || row['detalhes'] || '';

    // Validate essential columns
    if (!rawDate.trim() || !rawValor.trim()) {
      continue;
    }

    // Parse value (support 1000.50 and 1000,50 and currency symbols)
    const cleanValorStr = rawValor
      .replace(/R\$\s?/g, '')
      .replace(/\s+/g, '')
      .replace(/\.(?=\d{3}(?:[.,]|$))/g, '') // remove thousand dots
      .replace(',', '.'); // replace comma with dot
    
    const valor = parseFloat(cleanValorStr);
    if (isNaN(valor)) {
      continue;
    }

    // Parse date (dd/mm/yyyy or yyyy-mm-dd)
    const dateFormatted = parseDateToISO(rawDate.trim());
    if (!dateFormatted) {
      continue;
    }

    // Generate or use ID
    const id = rawId.trim() || `txn-${dateFormatted.iso}-${valor}-${rawDesc.slice(0, 20).replace(/\s+/g, '_')}`;

    totalParsed++;

    // Check deduplication
    if (existingMap.has(id)) {
      duplicateCount++;
      continue;
    }

    const { merchantKey, displayName } = extractMerchantKey(rawDesc);
    const { category, source } = determineCategory(merchantKey, rawDesc, valor, savedRules);

    const txn: Transaction = {
      id,
      date: dateFormatted.iso,
      dateBR: dateFormatted.br,
      valor,
      desc: rawDesc.trim(),
      merchantKey,
      displayName,
      category,
      categorySource: source,
    };

    newTransactions.push(txn);
    existingMap.set(id, txn);
    newCount++;
  }

  // Combine and sort all transactions descending by date
  const combined = Array.from(existingMap.values()).sort((a, b) => {
    if (a.date !== b.date) {
      return b.date.localeCompare(a.date);
    }
    // Secondary sort: stable order or valor
    return b.valor - a.valor;
  });

  return {
    transactions: combined,
    totalParsed,
    newCount,
    duplicateCount,
    errors,
  };
}

/**
 * Normalizes dates:
 * - 01/08/2026 -> { iso: '2026-08-01', br: '01/08/2026' }
 * - 2026-08-01 -> { iso: '2026-08-01', br: '01/08/2026' }
 */
function parseDateToISO(dateStr: string): { iso: string; br: string } | null {
  if (!dateStr) return null;

  // Pattern dd/mm/yyyy or dd-mm-yyyy
  const ddmmyyyy = dateStr.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (ddmmyyyy) {
    const day = ddmmyyyy[1].padStart(2, '0');
    const month = ddmmyyyy[2].padStart(2, '0');
    const year = ddmmyyyy[3];
    return {
      iso: `${year}-${month}-${day}`,
      br: `${day}/${month}/${year}`,
    };
  }

  // Pattern yyyy-mm-dd
  const yyyymmdd = dateStr.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
  if (yyyymmdd) {
    const year = yyyymmdd[1];
    const month = yyyymmdd[2].padStart(2, '0');
    const day = yyyymmdd[3].padStart(2, '0');
    return {
      iso: `${year}-${month}-${day}`,
      br: `${day}/${month}/${year}`,
    };
  }

  return null;
}
