import assert from 'node:assert/strict';
import test from 'node:test';
import { isValidISODate, parseLocalizedAmount } from './format';

test('parses Brazilian and international currency formats', () => {
  assert.equal(parseLocalizedAmount('R$ 1.250,50'), 1250.5);
  assert.equal(parseLocalizedAmount('1250,50'), 1250.5);
  assert.equal(parseLocalizedAmount('1,250.50'), 1250.5);
  assert.equal(parseLocalizedAmount('-1.250,50'), -1250.5);
  assert.equal(parseLocalizedAmount('1.250'), 1250);
});

test('rejects malformed amounts and calendar dates', () => {
  assert.equal(parseLocalizedAmount('1.2.3'), null);
  assert.equal(parseLocalizedAmount('R$ abc'), null);
  assert.equal(isValidISODate('2026-02-28'), true);
  assert.equal(isValidISODate('2026-02-30'), false);
  assert.equal(isValidISODate('01/02/2026'), false);
});
