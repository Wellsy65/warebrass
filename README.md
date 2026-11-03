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

The initial deployment uses the Worker configured in `wrangler.jsonc`. Attach `warebrass.com` only after the preview deployment has been approved.
