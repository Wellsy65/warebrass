import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { XMLParser } from 'fast-xml-parser';

const source = resolve(process.argv[2] ?? 'warebrass.WordPress.2026-10-18.xml');
const destination = resolve('src/data/wordpress.json');

const value = (input) => {
  if (input == null) return '';
  if (typeof input === 'object') return input.__cdata ?? input.__text ?? '';
  return String(input);
};

const list = (input) => input == null ? [] : Array.isArray(input) ? input : [input];
const cleanPath = (url) => {
  try { return new URL(value(url).replace('http://new.warebrass.com', 'https://www.warebrass.com')).pathname; }
  catch { return '/'; }
};

const cleanHtml = (html) => value(html)
  .replace(/<!--\s*\/?wp:[\s\S]*?-->/g, '')
  .replace(/<script[\s\S]*?<\/script>/gi, '')
  .replace(/https?:\/\/(?:www\.|new\.)?warebrass\.com\/wp-content\/uploads\//gi, '/uploads/')
  .replace(/https?:\/\/(?:www\.|new\.)?warebrass\.com/gi, '')
  .replace(/href="\/[^"]*\/warebrass@outlook\.com"/gi, 'href="mailto:warebrass@outlook.com"')
  .replace(/\/uploads\/2012\/10\/Choreography(?:-150x150)?\.jpg/gi, '/uploads/2018/05/Ware-Brass-Logo.jpg')
  .replace(/\/uploads\/2012\/10\/Phillip-Littlemore\.jpg/gi, '/uploads/2018/05/cropped-WB-Main-Photo.jpg')
  .replace(/\sclass="wp-[^"]*"/gi, '')
  .trim();

const plainText = (html) => cleanHtml(html)
  .replace(/<[^>]*>/g, ' ')
  .replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&#8217;|&rsquo;/g, '’')
  .replace(/&#8211;|&ndash;/g, '–')
  .replace(/\s+/g, ' ')
  .trim();

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  cdataPropName: '__cdata',
  textNodeName: '__text',
  parseTagValue: false,
  trimValues: false,
  isArray: (name) => ['item', 'category', 'wp:postmeta', 'wp:comment'].includes(name),
});

const xml = await readFile(source, 'utf8');
const channel = parser.parse(xml).rss.channel;
const items = list(channel.item);

const attachments = items
  .filter((item) => value(item['wp:post_type']) === 'attachment')
  .map((item) => ({
    id: Number(value(item['wp:post_id'])),
    title: value(item.title),
    caption: value(item['excerpt:encoded']),
    alt: value(list(item['wp:postmeta']).find((meta) => value(meta['wp:meta_key']) === '_wp_attachment_image_alt')?.['wp:meta_value']),
    url: value(item['wp:attachment_url']).replace(/^https?:\/\/(?:www\.|new\.)?warebrass\.com\/wp-content\/uploads\//i, '/uploads/'),
    path: cleanPath(item.link),
    parent: Number(value(item['wp:post_parent'])) || null,
  }));

const attachmentsById = new Map(attachments.map((attachment) => [attachment.id, attachment]));

const content = items
  .filter((item) => ['page', 'post'].includes(value(item['wp:post_type'])))
  .filter((item) => value(item['wp:status']) === 'publish')
  .map((item) => {
    const meta = list(item['wp:postmeta']);
    const thumbnailId = Number(value(meta.find((entry) => value(entry['wp:meta_key']) === '_thumbnail_id')?.['wp:meta_value']));
    const html = cleanHtml(item['content:encoded']);
    const firstEmbeddedImage = html.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1] ?? null;
    const excerpt = plainText(value(item['excerpt:encoded']) || html).slice(0, 220);
    return {
      id: Number(value(item['wp:post_id'])),
      type: value(item['wp:post_type']),
      title: value(item.title) || 'From the archive',
      slug: value(item['wp:post_name']),
      path: cleanPath(item.link),
      date: value(item['wp:post_date_gmt']).replace(' ', 'T') + 'Z',
      modified: value(item['wp:post_modified_gmt']).replace(' ', 'T') + 'Z',
      author: value(item['dc:creator']),
      html,
      excerpt,
      featuredImage: attachmentsById.get(thumbnailId)?.url ?? firstEmbeddedImage,
      categories: list(item.category).map((category) => value(category)).filter(Boolean),
    };
  });

const output = {
  generatedAt: new Date().toISOString(),
  site: {
    title: value(channel.title),
    description: value(channel.description),
    url: value(channel.link),
  },
  pages: content.filter((item) => item.type === 'page'),
  posts: content.filter((item) => item.type === 'post').sort((a, b) => b.date.localeCompare(a.date)),
  attachments,
};

await mkdir(dirname(destination), { recursive: true });
await writeFile(destination, `${JSON.stringify(output, null, 2)}\n`);
console.log(`Imported ${output.pages.length} pages, ${output.posts.length} posts, and ${output.attachments.length} attachments.`);
