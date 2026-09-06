---
name: add-route
description: Add an Astro page or endpoint under src/pages that fetches through the tagged fetch layer and reserves cache tags. Use when asked for a new URL, page or API endpoint.
---

# Add a route

Route files are thin: fetch, set cache tags, render a feature component.

1. `npm run plop route` (choose page or endpoint) or copy `src/pages/[...uri].astro`.
2. Fetch through `sanityFetch` / `trySanityFetch` from `src/features/sanity/fetch.ts`.
   Always pass `tags` and `cache: Astro.cache`; include `SITE_TAG` when the layout renders
   the header and footer. Never fetch with `sanity:client` directly from a page.
3. Handle `null` data: render `ConnectSanity` when Sanity is unreachable and
   `return Astro.rewrite('/404')` when the document does not exist.
4. Wrap the page in `BaseLayout` with `buildMetadata(...)` so canonical, OG and robots are
   right. Add JSON-LD for articles.
5. Endpoints return `apiJson` / `apiError` from `src/features/utils/api-error.ts` and call
   `cache.set({ tags })` for cacheable GETs.
6. Add the route to `SITEMAP_QUERY`, `AGENT_INVENTORY_QUERY` and the middleware inventory
   check in `src/middleware.ts` if it is a public content route.
7. `npm run check && npm run typecheck && npm run build`.
