'use strict';
// Remote Stremio addon adapter. No scraping or undocumented API required.
const BASE = (process.env.VNSTREAM_GUEST_URL || 'https://addon.vnstream.io.vn/guest').replace(/\\/+$/, '');
const timeout = Number(process.env.VNSTREAM_GUEST_TIMEOUT || 6500);
async function request(path) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeout);
  try {
    const response = await fetch(BASE + path, { signal: ctl.signal, headers: { Accept: 'application/json' } });
    if (!response.ok) return null;
    return await response.json();
  } catch (err) {
    console.warn('[vnstream-guest]', path, err.message);
    return null;
  } finally { clearTimeout(timer); }
}
function pathId(id) { return encodeURIComponent(String(id)).replace(/%3A/gi, ':'); }
function isRemoteId(id) { return String(id).startsWith('vng_'); }
function unprefix(id) { return String(id).slice(4); }
async function catalog(type, kind, extra = {}) {
  const suffix = [];
  if (extra.skip) suffix.push('skip=' + encodeURIComponent(extra.skip));
  if (extra.genre) suffix.push('genre=' + encodeURIComponent(extra.genre));
  if (extra.search) suffix.push('search=' + encodeURIComponent(extra.search));
  const path = '/catalog/' + type + '/' + kind + (suffix.length ? '/' + suffix.join('&') : '') + '.json';
  const data = await request(path);
  return (data?.metas || []).filter(m => m?.id && (m.type === type || !m.type)).map(m => ({
    ...m, id: 'vng_' + m.id, type,
    // Avoid false title/year deduplication when upstream metadata is incomplete.
    year: m.year || Number(String(m.releaseInfo || '').match(/\\b(?:19|20)\\d{2}\\b/)?.[0]) || undefined
  }));
}
async function streams(type, id) {
  const data = await request('/stream/' + type + '/' + pathId(id) + '.json');
  return (data?.streams || []).filter(s => s && (s.url || s.externalUrl)).map(s => ({
    ...s, name: 'VNStream · ' + (s.name || 'Nguồn phát'), _providerId: 'vnstream-guest'
  }));
}
async function meta(type, id) {
  const data = await request('/meta/' + type + '/' + pathId(id) + '.json');
  return data?.meta ? { ...data.meta, id: 'vng_' + data.meta.id, type } : null;
}
module.exports = { catalog, streams, meta, isRemoteId, unprefix };
