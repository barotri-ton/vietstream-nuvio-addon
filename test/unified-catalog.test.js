'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { mergeCatalog, identity, sourceCatalogs } = require('../src/unified-catalog');
test('same title/year/type deduplicates and prioritizes KKphim', () => {
  const rows = [
    { id: 'nc_a', name: 'Phim Mẫu', year: 2026, type: 'movie' },
    { id: 'kk_a', name: 'Phim Mẫu', year: 2026, type: 'movie' }
  ];
  const groups = mergeCatalog(rows, 'movie');
  assert.equal(groups.length, 1);
  assert.equal(groups[0].meta.id, 'kk_a');
  assert.deepEqual(groups[0].ids, ['nc_a', 'kk_a']);
});
test('different years and types do not merge', () => {
  const a = { id: 'kk_a', name: 'Phim Mẫu', year: 2025, type: 'movie' };
  const b = { id: 'nc_b', name: 'Phim Mẫu', year: 2026, type: 'movie' };
  assert.equal(mergeCatalog([a, b], 'movie').length, 2);
  assert.notEqual(identity(a, 'movie'), identity(a, 'series'));
});
test('unknown year does not merge unrelated titles', () => {
  assert.equal(mergeCatalog([{ id: 'kk_a', name: 'Test' }, { id: 'nc_b', name: 'Test' }], 'movie').length, 2);
});
test('disabled providers excluded from unified catalog', () => {
  assert.equal(sourceCatalogs('unified-movies', { kkphim: { id: 'kkphim' } }).every(([id]) => id === 'kkphim'), true);
});
