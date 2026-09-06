import { defineQuery } from "groq";
import { RICH_TEXT_FRAGMENT } from "../fragments/rich-text";
import { PAGE_BUILDER_FRAGMENT } from "../fragments/sections";
import { SEO_FRAGMENT } from "../fragments/seo";

export const LEGAL_BY_SLUG_QUERY =
  defineQuery(`*[_type == "legalPage" && slug.current == $slug][0]{
  _id,
  _type,
  _updatedAt,
  title,
  "slug": slug.current,
  "path": "/legal/" + slug.current,
  lastUpdated,
  "body": body[]${RICH_TEXT_FRAGMENT},
  "pageBuilder": pageBuilder[]${PAGE_BUILDER_FRAGMENT},
  "seo": seo${SEO_FRAGMENT},
  "serveMarkdown": agents.serveMarkdown != false,
  "passwordProtect": security.passwordProtect == true
}`);

export const LEGAL_SLUGS_QUERY =
  defineQuery(`*[_type == "legalPage" && defined(slug.current)]{
  "slug": slug.current
}`);

export const LEGAL_PAGES_QUERY =
  defineQuery(`*[_type == "legalPage" && defined(slug.current)] | order(title asc){
  _id,
  title,
  "slug": slug.current,
  lastUpdated
}`);
