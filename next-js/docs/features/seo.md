# SEO

## Metadata (`features/site/metadata.ts`)

`buildMetadata({ site, seo, title, path })` merges document `seo` over
`site.seo` field by field: an empty override falls back. It sets title
(`<doc title> | <site name>`), description, canonical
(`NEXT_PUBLIC_URL + path`), robots (`noIndex`), Open Graph and Twitter cards.

OG image order: document `seo.image`, then `site.seo.image`, cropped to
1200 x 630 with `ogImageUrl()` (`features/sanity/image.ts`, `fit("crop")`,
hotspot-aware), then the generated card at `/og?title=...`.

## Routes

- `app/sitemap.ts`: `SITEMAP_QUERY` excludes `noIndex`, password-protected and
  unpublished documents. `force-dynamic`.
- `app/robots.txt/route.ts`: written by hand so it can emit the
  `Content-Signal` line. Allows search and citation bots, disallows training
  bots, `/api/` and `/studio`.
- `app/feed.xml/route.ts`: RSS 2.0 from articles.
- `app/og/route.tsx`: `ImageResponse` fallback card with the site name and title.

## JSON-LD

`features/site/json-ld.tsx` renders `WebSite` in the layout and `Article` on
article pages. Keep it to those two unless a project needs more.

## Checklist for a new route

1. `generateMetadata` calling `buildMetadata`.
2. Add the type to `SITEMAP_QUERY` and `AGENT_INVENTORY_QUERY`.
3. If it is an article-like feed, add it to `feed.xml`.
