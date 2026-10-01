import { Settings, Transaction } from '../../types';

/**
 * Treats the opening balance as valid through its reference date. Only later
 * transactions are added to it; without a reference date, all history is used.
 */
export function calculateAccountBalance(transactions: Transaction[], settings: Settings): number {
  const openingBalance = settings.openingBalance ?? 0;
  const balanceDate = settings.openingBalance === null ? null : settings.openingBalanceDate;
  const movementSinceBalance = transactions.reduce((total, transaction) => {
    if (balanceDate && transaction.date <= balanceDate) return total;
    return total + transaction.valor;
  }, 0);

  return openingBalance + movementSinceBalance;
}
