'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');

process.env.VERCEL = '1';
const app = require('../server');

test('Vercel exposes Stremio manifest without opening media proxy', async (t) => {
  assert.equal(typeof app, 'function');
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));

  const origin = `http://127.0.0.1:${server.address().port}`;
  const response = await fetch(origin + '/manifest.json');
  assert.equal(response.status, 200);
  const manifest = await response.json();
  assert.equal(manifest.id, 'community.barostream');
  assert.ok(Array.isArray(manifest.resources));
  assert.ok(Array.isArray(manifest.types));
  assert.ok(Array.isArray(manifest.catalogs));

  const proxy = await fetch(origin + '/hls/seg?url=anything');
  assert.equal(proxy.status, 501);
});
