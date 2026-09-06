import type { APIRoute } from 'astro';
import { env } from '@/env';
import { clearMarkdownCache } from '@/features/agents/serve-markdown';
import { tagsFromWebhook } from '@/features/sanity/tags';
import { readSignedWebhook } from '@/features/sanity/webhook';
import { clearRedirectsCache } from '@/features/site/redirects';
import { clearSecurityCache } from '@/features/site/security';
import { apiError, apiJson } from '@/features/utils/api-error';

/**
 * Sanity webhook target. Validates the signature, derives the cache tags
 * from `{ _type, _id, uri }` and purges them from the route cache
 * (Vercel CDN in production, memory in preview). Also clears the
 * middleware's short-lived caches so security, redirects and Markdown
 * eligibility follow the publish immediately.
 */
export const POST: APIRoute = async ({ request, cache }) => {
  const verdict = await readSignedWebhook(request, env.SANITY_REVALIDATE_SECRET);
  if (!verdict.ok) return apiError(verdict.status, verdict.code, verdict.error);

  const tags = tagsFromWebhook(verdict.payload);
  clearMarkdownCache();
  if (verdict.payload._type === 'site') {
    clearSecurityCache();
    clearRedirectsCache();
  } else {
    clearSecurityCache();
  }

  try {
    await cache.invalidate({ tags });
  } catch (error) {
    console.error('[revalidate] cache.invalidate failed', error);
    return apiError(
      500,
      'invalidate-failed',
      'Cache invalidation failed',
      'Check the cache provider configuration.',
    );
  }
  return apiJson({ ok: true, tags, cacheEnabled: cache.enabled });
};
