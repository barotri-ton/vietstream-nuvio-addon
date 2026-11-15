'use strict';
const { normTitle } = require('./utils');
const guest = require('./vnstream-guest');
const { CATALOG_DEFS } = require('./manifest');

const UNIFIED = [
  { id: 'unified-movies', type: 'movie', name: 'Phim lẻ · Tổng hợp' },
  { id: 'unified-series', type: 'series', name: 'Phim bộ · Tổng hợp' },
  { id: 'unified-cinema', type: 'movie', name: 'Phim chiếu rạp · Tổng hợp' },
  { id: 'unified-animation', type: 'series', name: 'Hoạt hình · Tổng hợp' },
  { id: 'unified-4k', type: 'movie', name: 'Phim 4K · Tổng hợp' },
  { id: 'unified-action', type: 'movie', name: 'Hành động · Tuyển chọn' },
  { id: 'unified-horror', type: 'movie', name: 'Kinh dị · Tuyển chọn' }
];
const PRIORITY = ['kkphim', 'nguonc', 'vnstream', 'phim4k', 'k20', 'tophim'];
const registry = new Map();
const TTL = 30 * 60 * 1000;
const MAX_REGISTRY = 2000;
function cleanYear(m) {
  const year = Number(m.year || String(m.releaseInfo || '').match(/\b(?:19|20)\d{2}\b/)?.[0]);
  return year >= 1900 && year <= 2100 ? year : null;
}
function identity(m, type) {
  const imdb = String(m.imdbId || '').toLowerCase();
  if (/^tt\d+$/.test(imdb)) return type + ':imdb:' + imdb;
  const year = cleanYear(m);
  const title = normTitle(m.name || '');
  // Fail closed: ambiguous entries are NOT merged without a known year.
  return title && year ? type + ':title:' + title + ':' + year : null;
}
function rank(id) {
  const pid = ({ kk: 'kkphim', nc: 'nguonc', vn: 'vnstream', p4k: 'phim4k', tp: 'tophim', x20: 'xem20' })[String(id).split('_')[0]] || String(id).split('_')[0];
  return PRIORITY.indexOf(pid) < 0 ? 999 : PRIORITY.indexOf(pid);
}
function mergeCatalog(rows, type) {
  const groups = new Map();
  for (const m of rows) {
    if (!m || !m.id || (m.type && m.type !== type)) continue;
    const key = identity(m, type) || 'unique:' + m.id;
    const g = groups.get(key);
    if (!g) groups.set(key, { meta: { ...m, type }, ids: [m.id] });
    else {
      if (!g.ids.includes(m.id)) g.ids.push(m.id);
      if (rank(m.id) < rank(g.meta.id)) g.meta = { ...m, type };
    }
  }
  return [...groups.values()];
}
function remember(groups) {
  const now = Date.now();
  for (const g of groups) registry.set(g.meta.id, { ids: g.ids, expires: now + TTL });
  for (const [k, v] of registry) if (v.expires <= now) registry.delete(k);
  while (registry.size > MAX_REGISTRY) registry.delete(registry.keys().next().value);
}
function mappedIds(id) {
  const v = registry.get(id);
  return v && v.expires > Date.now() ? [...v.ids] : [id];
}
function sourceCatalogs(id, providers) {
  const out = [];
  for (const [pid, defs] of Object.entries(CATALOG_DEFS)) {
    if (!providers[pid]) continue;
    for (const def of defs) {
      if (id === 'unified-movies' && def.type === 'movie' && !/chieu-rap/.test(def.id)) out.push([pid, def]);
      if (id === 'unified-series' && def.type === 'series' && !/hoat-hinh/.test(def.id)) out.push([pid, def]);
      if (id === 'unified-cinema' && /chieu-rap/.test(def.id)) out.push([pid, def]);
      if (id === 'unified-animation' && /hoat-hinh/.test(def.id)) out.push([pid, def]);
      if (id === 'unified-4k' && pid === 'phim4k' && def.type === 'movie') out.push([pid, def]);
    }
  }
  return out;
}
async function listUnified(id, type, providers, extra = {}) {
  const sources = sourceCatalogs(id, providers);
  const guestCatalogs = {
    'unified-movies': ['vnstream-top', 'vnstream-vietsub', 'vnstream-voice-over'],
    'unified-series': ['vnstream-top', 'vnstream-vietsub', 'vnstream-voice-over'],
    'unified-cinema': ['vnstream-top'],
    'unified-4k': ['vnstream-hd'],
    'unified-action': ['vnstream-top'],
    'unified-horror': ['vnstream-top']
  };
  const results = await Promise.allSettled(sources.map(async ([pid, def]) => {
    const kind = def.id.slice(pid.length + 1);
    return providers[pid].listCatalog(kind, { ...extra, skip: 0 });
  }));
  const guestResults = await Promise.allSettled((guestCatalogs[id] || []).map(kind =>
    guest.catalog(id === 'unified-series' ? 'series' : kind === 'vnstream-hd' ? 'VNStreamHD' : 'movie', kind,
      { ...extra, genre: id === 'unified-action' ? 'Hành Động' : id === 'unified-horror' ? 'Kinh Dị' : extra.genre })
  ));
  const rows = [...results, ...guestResults].flatMap(r => r.status === 'fulfilled' && Array.isArray(r.value) ? r.value : []);
  const groups = mergeCatalog(rows, type);
  remember(groups);
  const skip = Math.max(0, parseInt(extra.skip, 10) || 0);
  return groups.slice(skip, skip + 20).map(g => g.meta);
}
module.exports = { UNIFIED, identity, mergeCatalog, mappedIds, listUnified, sourceCatalogs };
