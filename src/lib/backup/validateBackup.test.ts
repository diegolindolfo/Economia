import assert from 'node:assert/strict';
import test from 'node:test';
import { validateBackupPayload } from './validateBackup';

const validTransaction = {
  id: 'txn-1',
  date: '2026-10-01',
  dateBR: '01/10/2026',
  valor: -35.5,
  desc: 'COMPRA - MERCADO CENTRAL',
  merchantKey: 'MERCADO CENTRAL',
  displayName: 'MERCADO CENTRAL',
  category: 'mercado',
  categorySource: 'heuristica',
};

test('accepts a complete app backup and legacy transaction arrays', () => {
  const backup = validateBackupPayload({
    exportedAt: '2026-10-01T12:00:00.000Z',
    transactions: [validTransaction],
    rules: {},
    settings: { openingBalance: 500, openingBalanceDate: '2026-09-30' },
  });
  assert.equal(backup.errors.length, 0);
  assert.equal(backup.data?.transactions.length, 1);
  assert.equal(backup.data?.settings.openingBalance, 500);

  const legacy = validateBackupPayload([validTransaction]);
  assert.equal(legacy.errors.length, 0);
  assert.equal(legacy.data?.settings.openingBalance, null);
});

test('rejects malformed transactions, duplicate IDs, and invalid settings', () => {
  const invalid = validateBackupPayload({
    transactions: [
      validTransaction,
      { ...validTransaction },
      { ...validTransaction, id: 'bad', date: '2026-02-30', valor: 'NaN' },
    ],
    rules: {},
    settings: { openingBalance: Infinity, openingBalanceDate: '2026-09-31' },
  });

  assert.equal(invalid.data, null);
  assert.match(invalid.errors.join(' '), /duplicado/i);
  assert.match(invalid.errors.join(' '), /inválidos/i);
  assert.match(invalid.errors.join(' '), /saldo inicial/i);
  assert.match(invalid.errors.join(' '), /data do saldo/i);
});
