'use strict';

const { CONFIG, PROVIDERS } = require('./config');
const { GENRE_MAP } = require('./providers/kkphim');

const CATALOG_DEFS = {
  kkphim: [
    { type: 'movie', id: 'kkphim-phim-le', name: 'Phim lẻ', search: true },
    { type: 'movie', id: 'kkphim-chieu-rap', name: 'Chiếu rạp' },
    { type: 'series', id: 'kkphim-phim-bo', name: 'Phim bộ', search: true },
    { type: 'series', id: 'kkphim-hoat-hinh', name: 'Hoạt hình' }
  ],
  phim4k: [
    { type: 'movie', id: 'phim4k-phim-le', name: 'VSMOV · Phim lẻ', search: true },
    { type: 'series', id: 'phim4k-phim-bo', name: 'VSMOV · Phim bộ', search: true }
  ]
};

function enabledProviders() {
  return [PROVIDERS.kkphim, PROVIDERS.phim4k];
}

function buildManifest(baseUrl) {
  const catalogs = Object.values(CATALOG_DEFS).flat().map(({ type, id, name, search }) => ({
    type, id, name,
    extra: [
      ...(id.startsWith('kkphim-') ? [{ name: 'genre', options: Object.keys(GENRE_MAP) }] : []),
      { name: 'skip' },
      ...(search ? [{ name: 'search' }] : [])
    ]
  }));
  return {
    id: CONFIG.manifest.id,
    version: CONFIG.manifest.version,
    name: CONFIG.manifest.name,
    description: 'BaroStream · KKphim và VSMOV (thử nghiệm).',
    logo: `${baseUrl}/logo.svg`,
    resources: ['catalog', 'stream', 'meta'],
    types: ['movie', 'series'],
    idPrefixes: ['tt', ...enabledProviders().map(provider => provider.prefix)],
    catalogs,
    behaviorHints: { configurable: false, configurationRequired: false }
  };
}

module.exports = { buildManifest, CATALOG_DEFS, enabledProviders };
