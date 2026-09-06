import { defineQuery } from "groq";
import { MEDIA_FRAGMENT } from "../fragments/media";
import { RICH_TEXT_FRAGMENT } from "../fragments/rich-text";
import { PAGE_BUILDER_FRAGMENT } from "../fragments/sections";
import { SEO_FRAGMENT } from "../fragments/seo";

/** Path of any routed document, derived from its type and uri/slug. */
export const DOCUMENT_PATH_PROJECTION = /* groq */ `select(
  _type == "homepage" => "/",
  _type == "page" => uri.current,
  _type == "article" => "/articles/" + slug.current,
  _type == "legalPage" => "/legal/" + slug.current
)`;

/** Filter matching every routed document that actually resolves to a path. */
export const ROUTED_FILTER = /* groq */ `(
  _type == "homepage" ||
  (_type == "page" && defined(uri.current)) ||
  (_type in ["article", "legalPage"] && defined(slug.current))
)`;

/** Filter for documents agents and search engines may see. */
export const INDEXABLE_FILTER = /* groq */ `${ROUTED_FILTER} && seo.noIndex != true && security.passwordProtect != true`;

/**
 * The stored Markdown for a request path. Resolves the homepage for "/",
 * pages by uri, articles and legal pages by namespace + slug. The caller
 * picks the perspective (published for agents, drafts for previews).
 */
export const MARKDOWN_BY_PATH_QUERY = defineQuery(`*[
  ($path == "/" && _type == "homepage") ||
  (_type == "page" && uri.current == $path) ||
  (_type == "article" && "/articles/" + slug.current == $path) ||
  (_type == "legalPage" && "/legal/" + slug.current == $path)
][0]{
  _id,
  _type,
  title,
  "path": ${DOCUMENT_PATH_PROJECTION},
  "serveMarkdown": agents.serveMarkdown != false,
  "markdown": agents.markdown,
  "passwordProtect": security.passwordProtect == true
}`);

/**
 * Every indexable routed document, for llms.txt generation and the agent
 * 404 map. Same visibility rules as the sitemap.
 */
export const AGENT_INVENTORY_QUERY =
  defineQuery(`*[${INDEXABLE_FILTER}] | order(_type asc, _updatedAt desc){
  _id,
  _type,
  title,
  "path": ${DOCUMENT_PATH_PROJECTION},
  "excerpt": coalesce(excerpt, seo.description),
  "updatedAt": _updatedAt
}`);

/** Every published path, whatever its visibility, for the real-404 inventory. */
export const ROUTED_PATHS_QUERY = defineQuery(`*[${ROUTED_FILTER}]{
  "path": ${DOCUMENT_PATH_PROJECTION}
}.path`);

/**
 * The full resolved document for the Markdown serializer: page builder,
 * rich text, media and links expanded. The serializer walks the result
 * and renders by factory type name. Perspective is chosen by the caller.
 */
export const DOCUMENT_FOR_SERIALIZER_QUERY = defineQuery(`*[_id == $id][0]{
  ...,
  "path": ${DOCUMENT_PATH_PROJECTION},
  "uri": uri.current,
  "slug": slug.current,
  "cover": cover${MEDIA_FRAGMENT},
  "categories": categories[]->{ _id, title, "slug": slug.current },
  "body": body[]${RICH_TEXT_FRAGMENT},
  "pageBuilder": pageBuilder[]${PAGE_BUILDER_FRAGMENT},
  "seo": seo${SEO_FRAGMENT},
  "serveMarkdown": agents.serveMarkdown != false,
  "passwordProtect": security.passwordProtect == true
}`);
