import { defineQuery } from "groq";
import { MEDIA_FRAGMENT } from "../fragments/media";
import {
  ARTICLE_CARD_FRAGMENT,
  PAGE_BUILDER_FRAGMENT,
} from "../fragments/sections";
import { SEO_FRAGMENT } from "../fragments/seo";

export const ARTICLE_BY_SLUG_QUERY =
  defineQuery(`*[_type == "article" && slug.current == $slug][0]{
  _id,
  _type,
  _updatedAt,
  title,
  "slug": slug.current,
  "path": "/articles/" + slug.current,
  excerpt,
  author,
  publishedAt,
  "cover": cover${MEDIA_FRAGMENT},
  "categories": categories[]->{ _id, title, "slug": slug.current },
  "pageBuilder": pageBuilder[]${PAGE_BUILDER_FRAGMENT},
  "seo": seo${SEO_FRAGMENT},
  "serveMarkdown": agents.serveMarkdown != false,
  "passwordProtect": security.passwordProtect == true
}`);

export const ARTICLES_QUERY = defineQuery(
  `*[_type == "article" && defined(slug.current)] | order(publishedAt desc)[0...$limit]${ARTICLE_CARD_FRAGMENT}`,
);

export const ARTICLE_SLUGS_QUERY =
  defineQuery(`*[_type == "article" && defined(slug.current)]{
  "slug": slug.current
}`);

export const CATEGORIES_QUERY =
  defineQuery(`*[_type == "category"] | order(title asc){
  _id,
  title,
  "slug": slug.current,
  description
}`);
