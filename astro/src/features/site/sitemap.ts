import { absoluteUrl } from '@/features/utils/absolute-url';

export type SitemapEntry = { path: string; lastmod?: string | null };

function escapeXml(value: string): string {
  return value.replace(
    /[<>&'"]/g,
    (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c] ?? c,
  );
}

export function buildSitemapXml(entries: SitemapEntry[], baseUrl: string): string {
  const urls = entries
    .map((entry) => {
      const loc = escapeXml(absoluteUrl(entry.path, baseUrl));
      const lastmod = entry.lastmod
        ? `<lastmod>${new Date(entry.lastmod).toISOString()}</lastmod>`
        : '';
      return `  <url><loc>${loc}</loc>${lastmod}</url>`;
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export type FeedItem = {
  title: string;
  path: string;
  description?: string | null;
  author?: string | null;
  publishedAt?: string | null;
};

export function buildRssXml(
  {
    title,
    description,
    baseUrl,
  }: { title: string; description?: string | undefined; baseUrl: string },
  items: FeedItem[],
): string {
  const entries = items
    .map((item) => {
      const link = escapeXml(absoluteUrl(item.path, baseUrl));
      return [
        '    <item>',
        `      <title>${escapeXml(item.title)}</title>`,
        `      <link>${link}</link>`,
        `      <guid isPermaLink="true">${link}</guid>`,
        item.description ? `      <description>${escapeXml(item.description)}</description>` : '',
        item.author ? `      <dc:creator>${escapeXml(item.author)}</dc:creator>` : '',
        item.publishedAt
          ? `      <pubDate>${new Date(item.publishedAt).toUTCString()}</pubDate>`
          : '',
        '    </item>',
      ]
        .filter(Boolean)
        .join('\n');
    })
    .join('\n');
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">',
    '  <channel>',
    `    <title>${escapeXml(title)}</title>`,
    `    <link>${escapeXml(baseUrl)}</link>`,
    `    <description>${escapeXml(description ?? title)}</description>`,
    `    <atom:link href="${escapeXml(absoluteUrl('/feed.xml', baseUrl))}" rel="self" type="application/rss+xml" />`,
    entries,
    '  </channel>',
    '</rss>',
    '',
  ].join('\n');
}
