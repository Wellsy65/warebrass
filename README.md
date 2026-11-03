# Ware Brass

The Astro website for [warebrass.com](https://www.warebrass.com), deployed as a static site on Cloudflare Workers.

## Local development

```sh
npm install
npm run dev
```

## WordPress migration

The migration is repeatable. It reads the WordPress WXR export and writes the normalized content used by Astro:

```sh
npm run import:wordpress
```

Original media lives under `public/uploads/`. Historic post and page URLs are generated unchanged.

## Build

```sh
npm run build
```

The static output is written to `dist/`.

## Deploy

After reviewing the production build and authenticating Wrangler:

```sh
npm run deploy
```

Deployment targets the existing `warebrass` Worker in Mark's Cloudflare account, configured in `wrangler.jsonc`. The deploy script uploads and activates a new Worker version while preserving its existing `test.warebrass.com` domain connection. Authenticate with a Cloudflare login that has permission to update that Worker. Domain changes are managed separately by the domain administrator.
