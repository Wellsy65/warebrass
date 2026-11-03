import { pages, posts } from '../data/site';

export function GET({ site }: { site: URL }) {
  const paths = ['/', '/news/', '/concerts/', '/gallery/', '/subscribe/', ...pages.map((item) => item.path), ...posts.map((item) => item.path)];
  const unique = [...new Set(paths)];
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${unique.map((path) => `  <url><loc>${new URL(path, site)}</loc></url>`).join('\n')}
</urlset>`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
}
