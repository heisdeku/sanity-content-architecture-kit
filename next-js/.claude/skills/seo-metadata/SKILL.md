---
name: seo-metadata
description: Change page metadata, Open Graph images, sitemap, robots, RSS or JSON-LD. Use when a route needs correct SEO output or when adding a type to the sitemap.
---

# SEO and metadata

Read `docs/features/seo.md`.

## Steps

1. Every page exports `generateMetadata` that calls `buildMetadata` from
   `features/site/metadata.ts` with the site defaults, the document `seo`,
   its title and its path.
2. OG images come from `ogImageUrl()` in `features/sanity/image.ts` (1200 x 630
   crop). The fallback card is `app/og/route.tsx`.
3. New routed types must be added to `SITEMAP_QUERY`
   (`sanity/queries/documents/sitemap.ts`), which already excludes `noIndex`,
   password-protected and unpublished documents.
4. `robots.txt` is hand-written in `features/site/robots.ts`. Do not switch to
   `MetadataRoute.Robots`; it cannot emit `Content-Signal`.
5. JSON-LD lives in `features/site/json-ld.tsx`. Keep it to `WebSite` and
   `Article` unless the project needs more.

## Verify

```
curl -s localhost:3000/ | grep -o '<meta property="og:[^>]*>'
curl -s localhost:3000/sitemap.xml | head
curl -s localhost:3000/robots.txt
```
