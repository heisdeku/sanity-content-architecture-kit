import type { ClientReturn, QueryParams } from '@sanity/client';
import type { APIContext } from 'astro';
import { hasViewToken, previewClient, publicClient } from './client';
import { SITE_TAG, uniqueTags } from './tags';

type CacheLike = APIContext['cache'];

export class SanityUnavailableError extends Error {
  override name = 'SanityUnavailableError';
}

export type SanityFetchOptions<Q extends string> = {
  query: Q;
  params?: QueryParams;
  /** Required. Cache tags for everything this query touches (spec section 5). */
  tags: string[];
  /** Draft mode: viewer token, drafts perspective, stega, no caching. */
  draft?: boolean;
  /**
   * Pass `Astro.cache` (or `context.cache`) so the tags land on the response.
   * Astro caches responses, not fetches, so the route is a hit or a miss as a
   * whole; every fetch adds its tags and `type:site` is always included.
   */
  cache?: CacheLike;
};

/**
 * The fetch layer (spec section 5). Published content goes through
 * `publicClient` (perspective published, CDN off in production). Draft mode
 * goes through `previewClient` (token, drafts perspective, stega on) and opts
 * the response out of the route cache.
 */
export async function sanityFetch<const Q extends string>({
  query,
  params = {},
  tags,
  draft = false,
  cache,
}: SanityFetchOptions<Q>): Promise<ClientReturn<Q>> {
  if (cache) {
    if (draft) cache.set(false);
    else cache.set({ tags: uniqueTags(tags, SITE_TAG) });
  }
  if (draft && !hasViewToken) {
    throw new SanityUnavailableError('SANITY_API_VIEW_TOKEN is required for draft mode');
  }
  const client = draft ? previewClient : publicClient;
  try {
    return await client.fetch(query, params, draft ? { stega: true } : {});
  } catch (error) {
    throw new SanityUnavailableError(describeError(error));
  }
}

export type SafeResult<T> = { data: T; error: null } | { data: null; error: string };

/**
 * Same as `sanityFetch` but never throws: routes render an empty state when
 * Sanity is unreachable (placeholder project id, network down) instead of a
 * 500. The error is logged once per request.
 */
export async function trySanityFetch<const Q extends string>(
  options: SanityFetchOptions<Q>,
): Promise<SafeResult<ClientReturn<Q>>> {
  try {
    return { data: await sanityFetch(options), error: null };
  } catch (error) {
    const message = describeError(error);
    console.warn(`[sanity] fetch failed: ${message}`);
    // An outage response (empty state, 404) must never enter the route cache,
    // or it would be served until the next publish busts the tag.
    options.cache?.set(false);
    return { data: null, error: message };
  }
}

function describeError(error: unknown): string {
  if (error instanceof Error) {
    const status = (error as { statusCode?: number }).statusCode;
    return status ? `${error.message} (HTTP ${status})` : error.message;
  }
  return String(error);
}
