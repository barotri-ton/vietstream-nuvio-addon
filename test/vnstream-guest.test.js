'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const guest = require('../src/vnstream-guest');

test('VNStream Guest resolves a localized movie using its original title and release year', async (t) => {
  const called = [];
  t.mock.method(globalThis, 'fetch', async url => {
    const path = new URL(url).pathname;
    called.push(path);
    if (path.includes('/catalog/')) {
      return Response.json({ metas: [
        { id: 'documentary', name: 'About Oppenheimer', year: 2023 },
        { id: 'remake', name: 'Oppenheimer', year: 2001 },
        { id: 'movie-match', name: 'Tên tiếng Việt', year: 2023, description: 'Tên tiếng Việt / Oppenheimer' }
      ] });
    }
    return Response.json({ streams: [{ url: 'https://video.example/movie.m3u8' }] });
  });

  const streams = await guest.resolveStreams({ type: 'movie', titles: ['Oppenheimer'], year: 2023 });
  assert.equal(streams.length, 1);
  assert.equal(streams[0].url, 'https://video.example/movie.m3u8');
  assert.deepEqual(called.filter(path => path.includes('/stream/')), ['/guest/stream/movie/movie-match.json']);
});
