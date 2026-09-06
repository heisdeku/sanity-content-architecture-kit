---
name: seo-metadata
description: Metadata, OpenGraph, JSON-LD, sitemap, robots and RSS conventions. Use when changing head tags, share images or crawl policy.
---

# SEO metadata

- `src/features/site/metadata.ts` builds `PageMetadata`: document `seo` overrides site
  defaults field by field, empty override falls back. Canonical is `PUBLIC_URL + path`.
- OG image: `doc.seo.image` then `site.seo.image`, cropped to 1200x630 through
  `ogImageUrl` (`@sanity/image-url`, hotspot aware). Fallback: `/og` serves
  `public/og-fallback.png`; swap in satori + @resvg/resvg-js for dynamic cards.
- `BaseLayout` renders the tags and a `WebSite` JSON-LD; pass `jsonLd={[articleJsonLd(...)]}`
  on article pages.
- Sitemap (`src/pages/sitemap.xml.ts`) uses `SITEMAP_QUERY`, which excludes noIndex,
  password protected and unpublished documents. `robots.txt` policy is in
  `src/features/site/robots.ts` (allow search bots, block training bots, Content-Signal).
- RSS: `src/pages/feed.xml.ts` from `ARTICLES_QUERY`.
- Never hardcode a title or description in a route; they come from the CMS through the builder.
