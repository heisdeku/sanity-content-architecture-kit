import { SITEMAP_QUERY } from '@studio/queries/documents/sitemap';
import type { APIRoute } from 'astro';
import { env } from '@/env';
import { trySanityFetch } from '@/features/sanity/fetch';
import { typeTag } from '@/features/sanity/tags';
import { buildSitemapXml } from '@/features/site/sitemap';

export const GET: APIRoute = async ({ cache }) => {
  const { data } = await trySanityFetch({
    query: SITEMAP_QUERY,
    tags: [
      typeTag('inventory'),
      typeTag('homepage'),
      typeTag('page'),
      typeTag('article'),
      typeTag('legalPage'),
    ],
    cache,
  });
  const entries = (data ?? [])
    .filter((row) => typeof row.path === 'string')
    .map((row) => ({ path: row.path as string, lastmod: row._updatedAt }));
  return new Response(buildSitemapXml(entries, env.PUBLIC_URL), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=600',
    },
  });
};
