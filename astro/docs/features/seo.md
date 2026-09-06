# SEO

Where: `src/features/site/{metadata,json-ld,robots,sitemap}.ts`, `src/pages/{sitemap.xml,robots.txt,feed.xml,og}.ts`, `src/layouts/base-layout.astro`.

- `buildMetadata({ site, doc, path, baseUrl })`: document `seo` overrides the
  Site defaults field by field; empty overrides fall back. Title is
  `"<doc> | <site>"` or the site title. Canonical is `PUBLIC_URL + path`.
  `noIndex` sets `robots: noindex, nofollow`.
- OG image: `doc.seo.image`, then `site.seo.image`, cropped to 1200x630 with
  `@sanity/image-url` (`fit('crop')`, hotspot aware). Fallback `/og?path=...`.
- `/og` serves the static `public/og-fallback.png`. The Next edition renders a
  dynamic card with `ImageResponse`; here satori + `@resvg/resvg-js` were left
  out to keep the install dependency-light and offline-safe (satori also needs a
  TTF/OTF font file, and the Geist packages ship woff2 only). To add dynamic
  cards, install both, add a TTF, and replace the body of `src/pages/og.ts`.
- JSON-LD: `WebSite` on every page, `Article` on article pages.
- Sitemap from `SITEMAP_QUERY` (published, not noIndex, not password protected),
  RSS 2.0 from `FEED_QUERY`, `robots.txt` allows search and citation bots,
  blocks training bots and sends `Content-Signal: search=yes, ai-train=no, use=reference`.
