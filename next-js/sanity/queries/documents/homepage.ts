import { defineQuery } from "groq";
import { PAGE_BUILDER_FRAGMENT } from "../fragments/sections";
import { SEO_FRAGMENT } from "../fragments/seo";

export const HOMEPAGE_QUERY = defineQuery(`*[_type == "homepage"][0]{
  _id,
  _type,
  _updatedAt,
  title,
  "path": "/",
  "pageBuilder": pageBuilder[]${PAGE_BUILDER_FRAGMENT},
  "seo": seo${SEO_FRAGMENT},
  "serveMarkdown": agents.serveMarkdown != false,
  "passwordProtect": security.passwordProtect == true
}`);
