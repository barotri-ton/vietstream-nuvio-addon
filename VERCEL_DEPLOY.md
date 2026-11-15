# Vercel deployment for Stremio

This fork exports the Express app from `server.js` for Vercel's native Express deployment. No `vercel.json` rewrite or extra API endpoint is needed.

## Install

1. Import `barotri-ton/vietstream-nuvio-addon` into a Vercel project (Node.js / Express, root directory `.`).
2. Deploy the default `main` branch. Use a publicly accessible production domain (do not require Vercel login).
3. Open `https://YOUR_PROJECT.vercel.app/manifest.json` and verify JSON `id`, `resources`, `types` and `catalogs`.
4. Paste this exact HTTPS URL into **Stremio → Addons → Add addon**.

The raw GitHub path `/nuvio-plugin/manifest.json` is **not** a Stremio manifest.

## Hosting limitation and security

Vercel is intended to serve the addon metadata, catalogs, and direct stream URLs, **not to relay movies**. On Vercel:

- `PROXY_PROVIDERS` defaults to `none`; streams use their original URLs.
- `/hls/*` proxy endpoints are explicitly disabled. This avoids exposing the original open proxy publicly and avoids Vercel Function response/payload limits for video segments.
- Sources that require proxying or custom Referer/Origin headers may fail playback. Use the repository's Render blueprint (or another persistent Node.js host) for those sources, with an authenticated/restricted proxy.
- Never commit provider credentials. Set optional `XEM20_LOGIN` and `XEM20_PASSWORD` using hosting environment secrets.

## Smoke tests

```bash
npm ci
npm test
npm start  # local persistent Node hosting, http://localhost:7001/manifest.json
```

On production, verify `/manifest.json` returns valid Stremio JSON, `/catalog/movie/kkphim-phim-le.json` returns a `metas` array, and a known licensed movie stream is playable. A valid manifest does not guarantee all third-party sources work.
