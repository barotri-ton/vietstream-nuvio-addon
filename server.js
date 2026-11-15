'use strict';

const express = require('express');
const cors = require('cors');

// Vercel Functions are not a suitable public media-segment proxy.
// Keep ordinary Stremio streams direct and disable open HLS proxy endpoints.
const isVercel = Boolean(process.env.VERCEL);
if (isVercel && !process.env.PROXY_PROVIDERS) {
  process.env.PROXY_PROVIDERS = 'none';
}

const routes = require('./src/routes');
const { CONFIG } = require('./src/config');

const app = express();
app.disable('x-powered-by');
app.use(cors({ origin: true }));

if (isVercel) {
  app.use('/hls', (_req, res) => res.status(501).json({
    error: 'HLS proxy is disabled on Vercel. Use a persistent Node host for proxy-required streams.'
  }));
}

app.use(routes);

app.use((err, _req, res, _next) => {
  console.error('[server]', err.message);
  if (!res.headersSent) res.status(500).json({ err: 'internal error' });
});

if (require.main === module && !isVercel) {
  app.listen(CONFIG.port, () => {
    console.log('\n🎬 VietStream addon đang chạy.');
    console.log(`   Manifest (dán vào Nuvio/Stremio): http://localhost:${CONFIG.port}/manifest.json`);
    console.log(`   Trang chủ: http://localhost:${CONFIG.port}/\n`);
  });
}

// Vercel auto-detects this exported Express app as a Node.js Function.
module.exports = app;
