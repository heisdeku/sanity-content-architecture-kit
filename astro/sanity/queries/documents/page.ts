import { defineQuery } from "groq";
import { PAGE_BUILDER_FRAGMENT } from "../fragments/sections";
import { SEO_FRAGMENT } from "../fragments/seo";

export const PAGE_BY_URI_QUERY =
  defineQuery(`*[_type == "page" && uri.current == $uri][0]{
  _id,
  _type,
  _updatedAt,
  title,
  "uri": uri.current,
  "path": uri.current,
  "pageBuilder": pageBuilder[]${PAGE_BUILDER_FRAGMENT},
  "seo": seo${SEO_FRAGMENT},
  "serveMarkdown": agents.serveMarkdown != false,
  "passwordProtect": security.passwordProtect == true
}`);

export const PAGE_URIS_QUERY =
  defineQuery(`*[_type == "page" && defined(uri.current)]{
  "uri": uri.current
}`);
