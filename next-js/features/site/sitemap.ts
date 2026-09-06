import type { MetadataRoute } from "next";
import { publishedFetch, safe } from "@/features/sanity/fetch";
import { typeTag } from "@/features/sanity/tags";
import { absoluteUrl } from "@/features/utils/absolute-url";
import { SITEMAP_QUERY } from "@/sanity/queries/documents/sitemap";

const ROUTED_TYPES = ["homepage", "page", "article", "legalPage"];

/** Sitemap entries from published, indexable, unprotected documents. Empty on failure. */
export async function buildSitemap(): Promise<MetadataRoute.Sitemap> {
  const { data } = await safe(
    publishedFetch({ query: SITEMAP_QUERY, tags: ROUTED_TYPES.map(typeTag) }),
  );
  const entries: MetadataRoute.Sitemap = [];
  for (const doc of data ?? []) {
    if (!doc.path) continue;
    entries.push({
      url: absoluteUrl(doc.path),
      lastModified: doc._updatedAt,
      changeFrequency: doc._type === "article" ? "monthly" : "weekly",
      priority: doc.path === "/" ? 1 : doc._type === "article" ? 0.6 : 0.8,
    });
  }
  return entries;
}
