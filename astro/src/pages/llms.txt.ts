import { LLMS_TXT_QUERY } from '@studio/queries/documents/site';
import type { APIRoute } from 'astro';
import { trySanityFetch } from '@/features/sanity/fetch';
import { SITE_TAG } from '@/features/sanity/tags';

/**
 * Serves the PUBLISHED site.agents.llmsTxt verbatim. 404 unless the editor
 * turned on "Serve llms.txt". Never generated on the fly.
 */
export const GET: APIRoute = async ({ cache }) => {
  const { data } = await trySanityFetch({ query: LLMS_TXT_QUERY, tags: [SITE_TAG], cache });
  if (!data?.serveLlmsTxt || !data.llmsTxt?.trim()) {
    return new Response('Not found\n', {
      status: 404,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=60',
      },
    });
  }
  return new Response(`${data.llmsTxt.trim()}\n`, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
};
