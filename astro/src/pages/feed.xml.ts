import { SITE_QUERY } from '@studio/queries/documents/site';
import { FEED_QUERY } from '@studio/queries/documents/sitemap';
import type { APIRoute } from 'astro';
import { env } from '@/env';
import { trySanityFetch } from '@/features/sanity/fetch';
import { typeTag } from '@/features/sanity/tags';
import { buildRssXml } from '@/features/site/sitemap';
import { asString } from '@/features/utils/as-string';

export const GET: APIRoute = async ({ cache }) => {
  const [{ data: site }, { data: articles }] = await Promise.all([
    trySanityFetch({ query: SITE_QUERY, tags: [], cache }),
    trySanityFetch({ query: FEED_QUERY, tags: [typeTag('article')], cache }),
  ]);
  const xml = buildRssXml(
    {
      title: asString(site?.name) ?? 'Articles',
      description: asString(site?.tagline),
      baseUrl: env.PUBLIC_URL,
    },
    (articles ?? []).map((article) => ({
      title: asString(article.title) ?? 'Untitled',
      path: asString(article.path) ?? '/articles',
      description: asString(article.excerpt),
      author: asString(article.author),
      publishedAt: asString(article.publishedAt),
    })),
  );
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=600',
    },
  });
};
