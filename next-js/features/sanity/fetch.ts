import { draftMode } from "next/headers";
import type { ClientReturn, QueryParams } from "next-sanity";
import { env } from "@/env";
import { client, previewClient } from "@/features/sanity/client";
import { withSiteTag } from "@/features/sanity/tags";

export type SanityFetchOptions<Q extends string> = {
  query: Q;
  params?: QueryParams;
  /** Required. Use the helpers in features/sanity/tags.ts. */
  tags: readonly string[];
};

/**
 * The fetch layer (docs/architecture.md §5).
 *
 * Published: `force-cache` + `revalidate: false` + tags. The Data Cache serves
 * every request until /api/revalidate busts a tag.
 * Draft mode: token client, drafts perspective, stega, no cache.
 *
 * Routes that call this export `dynamic = "force-dynamic"`: in Next 16 reading
 * `draftMode()` does not opt out of prerendering by itself, and the build must
 * never call Sanity. Pages render at request time; the Data Cache caches per fetch.
 */
export async function sanityFetch<const Q extends string>({
  query,
  params = {},
  tags,
}: SanityFetchOptions<Q>): Promise<ClientReturn<Q>> {
  const { isEnabled } = await draftMode();

  if (isEnabled) {
    if (!env.SANITY_API_VIEW_TOKEN) {
      throw new Error("Draft mode needs SANITY_API_VIEW_TOKEN");
    }
    return previewClient.fetch(query, params, { cache: "no-store" });
  }

  return client.fetch(query, params, {
    cache: "force-cache",
    next: { revalidate: false, tags: withSiteTag(tags) },
  });
}

/**
 * Published-only fetch for metadata routes (sitemap, feed, llms.txt, proxy
 * helpers) that must never see drafts and do not read draftMode().
 */
export function publishedFetch<const Q extends string>({
  query,
  params = {},
  tags,
}: SanityFetchOptions<Q>): Promise<ClientReturn<Q>> {
  return client.fetch(query, params, {
    cache: "force-cache",
    next: { revalidate: false, tags: withSiteTag(tags) },
  });
}

export type SafeResult<T> =
  | { data: T; error: null }
  | { data: null; error: Error };

/**
 * Wraps a fetch so a missing or unreachable project renders an empty state
 * instead of a 500. Routes call `notFound()` on `data === null` with no error.
 */
export async function safe<T>(promise: Promise<T>): Promise<SafeResult<T>> {
  try {
    return { data: await promise, error: null };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("[sanity] fetch failed:", err.message);
    return { data: null, error: err };
  }
}
