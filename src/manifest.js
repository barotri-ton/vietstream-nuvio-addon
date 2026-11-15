'use strict';

const { CONFIG, PROVIDERS } = require('./config');
const { GENRE_MAP } = require('./providers/kkphim');

// Danh mục catalog khai báo cho từng nguồn (chỉ nguồn bật mới đưa vào manifest)
const CATALOG_DEFS = {
  kkphim: [
    { type: 'movie', id: 'kkphim-phim-le', name: 'Phim lẻ (KKphim)', genres: true },
    { type: 'movie', id: 'kkphim-chieu-rap', name: 'Chiếu rạp (KKphim)', genres: true },
    { type: 'series', id: 'kkphim-phim-bo', name: 'Phim bộ (KKphim)', genres: true },
    { type: 'series', id: 'kkphim-hoat-hinh', name: 'Hoạt hình (KKphim)', genres: true }
  ],
  nguonc: [
    { type: 'movie', id: 'nguonc-phim-le', name: 'Phim lẻ (NguonC)' },
    { type: 'series', id: 'nguonc-phim-bo', name: 'Phim bộ (NguonC)' }
  ],
  vnstream: [
    { type: 'movie', id: 'vnstream-moi', name: 'Mới nhất (VnStream)' },
    { type: 'movie', id: 'vnstream-hanh-dong', name: 'Hành động (VnStream)' },
    { type: 'series', id: 'vnstream-bo', name: 'Phim bộ (VnStream)' }
  ],
  phim4k: [
    { type: 'movie', id: 'phim4k-phim-le', name: 'Phim lẻ 4K (Phim4K)' },
    { type: 'series', id: 'phim4k-phim-bo', name: 'Phim bộ 4K (Phim4K)' }
  ],
  tophim: [],
  k20: [
    { type: 'movie', id: 'k20-movie', name: 'Phim lẻ đa nguồn (K20)' },
    { type: 'series', id: 'k20-series', name: 'Phim bộ đa nguồn (K20)' }
  ]
};

function enabledProviders() {
  return Object.values(PROVIDERS).filter((p) => p.enabled);
}

function buildManifest(baseUrl) {
  const on = enabledProviders();

  const catalogs = [];
  for (const p of on) {
    for (const def of CATALOG_DEFS[p.id] || []) {
      const extra = [{ name: 'search' }, { name: 'skip' }];
      if (def.genres) extra.unshift({ name: 'genre', options: Object.keys(GENRE_MAP) });
      catalogs.push({ type: def.type, id: def.id, name: def.name, extra });
    }
  }

  const names = on.map((p) => p.name).join(' · ');
  return {
    id: CONFIG.manifest.id,
    version: CONFIG.manifest.version,
    name: CONFIG.manifest.name,
    description: `${CONFIG.manifest.description}\nNguồn: ${names}`,
    logo: `${baseUrl}/logo.svg`,
    // VNStream-compatible generic resource declarations. Let Stremio request
    // metadata/streams for both IMDb IDs and provider-specific catalog IDs.
    resources: ['catalog', 'stream', 'meta'],
    types: ['movie', 'series'],
    catalogs,
    behaviorHints: { configurable: false, configurationRequired: false }
  };
}

module.exports = { buildManifest, CATALOG_DEFS, enabledProviders };
