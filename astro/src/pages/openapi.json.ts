import { LLMS_TXT_QUERY, SITE_QUERY } from '@studio/queries/documents/site';
import type { APIRoute } from 'astro';
import { env } from '@/env';
import { buildOpenApiDocument } from '@/features/agents/openapi';
import { trySanityFetch } from '@/features/sanity/fetch';
import { SITE_TAG } from '@/features/sanity/tags';
import { asString } from '@/features/utils/as-string';

export const GET: APIRoute = async ({ cache }) => {
  const [{ data: site }, { data: agents }] = await Promise.all([
    trySanityFetch({ query: SITE_QUERY, tags: [SITE_TAG], cache }),
    trySanityFetch({ query: LLMS_TXT_QUERY, tags: [SITE_TAG], cache }),
  ]);
  const document = buildOpenApiDocument({
    siteName: asString(site?.name) ?? 'Content Architecture Kit',
    baseUrl: env.PUBLIC_URL,
    llmsTxtEnabled: Boolean(agents?.serveLlmsTxt),
  });
  return new Response(JSON.stringify(document, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=600',
    },
  });
};
