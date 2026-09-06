import { cache } from "react";
import { publishedFetch, safe, sanityFetch } from "@/features/sanity/fetch";
import { typeTag } from "@/features/sanity/tags";
import type { Site } from "@/features/sanity/types";
import { SITE_QUERY } from "@/sanity/queries/documents/site";

const tags = [typeTag("site")];

/** The Site singleton, deduped per request. Null when missing or unreachable. */
export const getSite = cache(async (): Promise<Site | null> => {
  const { data } = await safe(sanityFetch({ query: SITE_QUERY, tags }));
  return (data as unknown as Site | null) ?? null;
});

/** Published Site for metadata routes that must not read draftMode(). */
export const getPublishedSite = cache(async (): Promise<Site | null> => {
  const { data } = await safe(publishedFetch({ query: SITE_QUERY, tags }));
  return (data as unknown as Site | null) ?? null;
});
