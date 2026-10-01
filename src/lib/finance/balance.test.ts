import assert from 'node:assert/strict';
import test from 'node:test';
import { Transaction } from '../../types';
import { calculateAccountBalance } from './balance';

function transaction(id: string, date: string, valor: number): Transaction {
  return {
    id,
    date,
    dateBR: '01/01/2026',
    valor,
    desc: 'Teste',
    merchantKey: 'TESTE',
    displayName: 'Teste',
    category: 'outros',
    categorySource: 'heuristica',
  };
}

test('adds only movements later than the opening balance reference date', () => {
  const transactions = [
    transaction('before', '2026-01-10', -100),
    transaction('same-day', '2026-01-15', -25),
    transaction('after', '2026-01-16', 80),
  ];

  assert.equal(
    calculateAccountBalance(transactions, { openingBalance: 500, openingBalanceDate: '2026-01-15' }),
    580
  );
});

test('uses all transactions when no reference date is configured', () => {
  const transactions = [transaction('expense', '2026-01-10', -100), transaction('income', '2026-01-16', 80)];
  assert.equal(calculateAccountBalance(transactions, { openingBalance: 500, openingBalanceDate: null }), 480);
  assert.equal(calculateAccountBalance(transactions, { openingBalance: null, openingBalanceDate: null }), -20);
  assert.equal(calculateAccountBalance(transactions, { openingBalance: null, openingBalanceDate: '2026-01-15' }), -20);
});
