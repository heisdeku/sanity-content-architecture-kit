import { defineQuery } from "groq";
import { DOCUMENT_PATH_PROJECTION, INDEXABLE_FILTER } from "./agents";

/** Sitemap entries: published, indexable, not password protected. */
export const SITEMAP_QUERY =
  defineQuery(`*[${INDEXABLE_FILTER}] | order(_updatedAt desc){
  _id,
  _type,
  "path": ${DOCUMENT_PATH_PROJECTION},
  _updatedAt,
  "publishedAt": coalesce(publishedAt, _createdAt)
}`);

/** Feed entries: published articles with the fields RSS needs. */
export const FEED_QUERY =
  defineQuery(`*[_type == "article" && defined(slug.current) && seo.noIndex != true && security.passwordProtect != true] | order(publishedAt desc)[0...50]{
  _id,
  title,
  "slug": slug.current,
  "path": "/articles/" + slug.current,
  excerpt,
  author,
  publishedAt,
  _updatedAt
}`);
