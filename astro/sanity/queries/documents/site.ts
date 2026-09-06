import { defineQuery } from "groq";
import { LINK_FRAGMENT } from "../fragments/link";
import { IMAGE_FRAGMENT, MEDIA_FRAGMENT } from "../fragments/media";
import { RICH_TEXT_FRAGMENT } from "../fragments/rich-text";
import { SEO_FRAGMENT } from "../fragments/seo";

const NAVIGATION_ITEM_FRAGMENT = /* groq */ `{
  _key,
  label,
  "link": link${LINK_FRAGMENT}
}`;

export const SITE_QUERY = defineQuery(`*[_type == "site" && _id == "site"][0]{
  _id,
  _updatedAt,
  name,
  tagline,
  "logo": logo${MEDIA_FRAGMENT},
  defaultLocale,
  "navigation": {
    "headerItems": headerItems[]${NAVIGATION_ITEM_FRAGMENT},
    "footerColumns": footerColumns[]{
      _key,
      title,
      "items": items[]${NAVIGATION_ITEM_FRAGMENT}
    },
    "socialLinks": socialLinks[]{
      _key,
      platform,
      "link": link${LINK_FRAGMENT}
    }
  },
  "seo": seo${SEO_FRAGMENT},
  "favicons": {
    "light": favicons.light${IMAGE_FRAGMENT},
    "dark": favicons.dark${IMAGE_FRAGMENT},
    "appleTouch": favicons.appleTouch${IMAGE_FRAGMENT}
  },
  "notFound": {
    "title": coalesce(notFound.title, "Page not found"),
    "description": notFound.description[]${RICH_TEXT_FRAGMENT},
    "link": notFound.link${LINK_FRAGMENT}
  },
  "notifications": {
    "recipients": coalesce(notifications.recipients, []),
    "fromAddress": notifications.fromAddress
  }
}`);

/**
 * Everything the proxy/middleware needs to decide on basic auth. Site-wide
 * protection wins; otherwise the request path is matched against the list.
 */
export const SITE_SECURITY_QUERY = defineQuery(`{
  "basicAuthEnabled": *[_type == "site" && _id == "site"][0].security.basicAuthEnabled == true,
  "protectedPaths": [
    ...select(*[_type == "homepage"][0].security.passwordProtect == true => ["/"], []),
    ...*[_type == "page" && security.passwordProtect == true && defined(uri.current)].uri.current,
    ...*[_type == "article" && security.passwordProtect == true && defined(slug.current)]{ "path": "/articles/" + slug.current }.path,
    ...*[_type == "legalPage" && security.passwordProtect == true && defined(slug.current)]{ "path": "/legal/" + slug.current }.path
  ]
}`);

export const REDIRECTS_QUERY =
  defineQuery(`coalesce(*[_type == "site" && _id == "site"][0].redirects[]{
  _key,
  from,
  permanent,
  "to": to${LINK_FRAGMENT}
}, [])`);

export const LLMS_TXT_QUERY =
  defineQuery(`*[_type == "site" && _id == "site"][0]{
  "serveLlmsTxt": agents.serveLlmsTxt == true,
  "llmsTxt": agents.llmsTxt,
  "guidance": agents.llmsTxtGuidance
}`);
