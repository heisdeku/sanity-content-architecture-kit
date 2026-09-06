import type { APIRoute } from 'astro';
import { decideMarkdown, markdownResponse } from '@/features/agents/serve-markdown';
import { SITE_TAG } from '@/features/sanity/tags';
import { apiError } from '@/features/utils/api-error';

/**
 * Serves stored per-page Markdown. Only reachable through the middleware
 * rewrite (Accept: text/markdown); direct requests get a 404 there.
 */
export const GET: APIRoute = async ({ locals, cache }) => {
  const path = locals.markdownRewrite?.path;
  if (!path) return apiError(404, 'not-found', 'Not found');
  const decision = await decideMarkdown(path);
  if (decision.kind === 'markdown') {
    cache.set({ tags: [...decision.tags, SITE_TAG], maxAge: 60, swr: 600 });
    return markdownResponse(decision.body, { tags: decision.tags });
  }
  if (decision.kind === 'not-found') {
    cache.set(false);
    return markdownResponse(decision.body, { status: 404 });
  }
  if (decision.kind === 'unavailable') {
    cache.set(false);
    return markdownResponse(decision.body, { status: 503 });
  }
  return apiError(
    406,
    'markdown-unavailable',
    'This page is not served as Markdown',
    'Request it as text/html.',
  );
};
