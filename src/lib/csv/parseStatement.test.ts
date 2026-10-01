import assert from 'node:assert/strict';
import test from 'node:test';
import { SAMPLE_NUBANK_CSV } from '../../data/sampleData';
import { parseNubankCSV } from './parseStatement';

test('continues to parse the app sample Nubank statement', () => {
  const result = parseNubankCSV(SAMPLE_NUBANK_CSV);
  assert.ok(result.newCount > 0);
  assert.equal(result.errors.length, 0);
});

test('parses quoted Brazilian currency values from semicolon-delimited files', () => {
  const result = parseNubankCSV('Data;Valor;Descrição\n01/10/2026;"R$ 1.250,50";SALÁRIO');
  assert.equal(result.newCount, 1);
  assert.equal(result.transactions[0].valor, 1250.5);
});

test('keeps distinct transactions that share their first 20 description characters', () => {
  const csv = [
    'Data,Valor,Descrição',
    '01/10/2026,-12.50,LOJA EXEMPLO UNIDADE ALPHA',
    '01/10/2026,-12.50,LOJA EXEMPLO UNIDADE BETA',
  ].join('\n');

  const imported = parseNubankCSV(csv);
  assert.equal(imported.newCount, 2);
  assert.notEqual(imported.transactions[0].id, imported.transactions[1].id);

  const reimported = parseNubankCSV(csv, imported.transactions);
  assert.equal(reimported.newCount, 0);
  assert.equal(reimported.duplicateCount, 2);
});

test('reports invalid dates and values instead of silently ignoring CSV rows', () => {
  const csv = [
    'Data,Valor,Descrição',
    '31/02/2026,-10.00,LOJA INVÁLIDA',
    '01/10/2026,valor ruim,OUTRA LOJA',
  ].join('\n');

  const result = parseNubankCSV(csv);
  assert.equal(result.totalParsed, 0);
  assert.equal(result.newCount, 0);
  assert.equal(result.errors.length, 2);
  assert.match(result.errors[0], /data inválida/i);
  assert.match(result.errors[1], /valor inválido/i);
});

test('rejects CSV files that do not have required headers', () => {
  const result = parseNubankCSV('Estabelecimento,Total\nMercado,20');
  assert.equal(result.totalParsed, 0);
  assert.match(result.errors.join(' '), /coluna de data/i);
  assert.match(result.errors.join(' '), /coluna de valor/i);
});
