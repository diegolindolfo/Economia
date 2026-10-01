/**
 * Extracts and normalizes the merchant/counterpart key from transaction descriptions.
 * Nubank patterns:
 * - Compra no débito - LOJA
 * - Compra no débito via NuPay - LOJA
 * - Transferência enviada pelo Pix - NOME - CPF/CNPJ - BANCO ...
 * - Transferência recebida pelo Pix via Open Banking - NOME - ...
 * - Transferência Recebida - NOME
 * - Reembolso recebido pelo Pix - NOME
 * - Aplicação RDB / Resgate RDB
 */

export function extractMerchantKey(desc: string): { merchantKey: string; displayName: string } {
  if (!desc) {
    return { merchantKey: 'OUTROS', displayName: 'Desconhecido' };
  }

  const trimmed = desc.trim();
  const parts = trimmed.split(' - ');
  let rawName = '';

  if (parts.length >= 2) {
    // If it's a Pix or Debit, parts[1] is the counterparty or merchant name
    rawName = parts[1].trim();
  } else {
    rawName = trimmed;
  }

  // Generate clean display name (preserving title casing if appropriate)
  const displayName = cleanDisplayName(rawName, trimmed);

  // Normalize for grouping and rule matching
  const merchantKey = normalizeMerchantKey(rawName);

  return { merchantKey, displayName };
}

export function normalizeMerchantKey(str: string): string {
  if (!str) return 'OUTROS';

  // 1. Remove accents (NFD normalize + strip combining diacritical marks)
  let normalized = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // 2. Uppercase
  normalized = normalized.toUpperCase();

  // 3. Remove non-alphanumeric except spaces
  normalized = normalized.replace(/[^A-Z0-9\s]/g, ' ');

  // 4. Remove terminal suffixes (Roman numerals like I, II, III, IV, V, VI, VII, VIII, IX, X, XI, XII or numbers like 01, 02)
  normalized = normalized.replace(/\s+(?:[IVXLCDM]+|\d{1,4})$/i, '');

  // 5. Collapse multiple spaces
  normalized = normalized.replace(/\s+/g, ' ').trim();

  return normalized || 'OUTROS';
}

function cleanDisplayName(rawName: string, fullDesc: string): string {
  // If rawName is meaningful, use it
  if (rawName && rawName.length > 1) {
    // Clean trailing POS store codes or numbers
    const cleaned = rawName.replace(/\s+(?:[IVXLCDM]+|\d{2,4})$/i, '').trim();
    return cleaned;
  }
  return fullDesc;
}
