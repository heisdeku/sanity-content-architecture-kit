---
name: add-route
description: Add an App Router page or route handler that fetches from Sanity and renders a feature. Use when a new URL is needed.
---

# Add a route

Routes stay thin: fetch, then render a feature component.

## Steps

1. `npm run plop route <path>` scaffolds `app/<path>/page.tsx` with
   `generateMetadata`, `sanityFetch` and `notFound()` wired.
2. Pick the query (`sanity/queries/documents/*`) and tags
   (`features/sanity/tags.ts`).
3. Render a component from `features/`; do not put markup in `app/`.
4. Metadata: `buildMetadata` from `features/site/metadata.ts`.
5. Add the route to `SITEMAP_QUERY`, `AGENT_INVENTORY_QUERY` and, if it is a
   public read, `features/agents/openapi.ts`.
6. Route handlers that must never run at build time export
   `const dynamic = "force-dynamic"`.
7. `npm run check && npm run typecheck && npm run build`.

## Rules

- Async `params` and `searchParams`: `const { slug } = await params`.
- No `generateStaticParams`.
- `typedRoutes` is on: link hrefs must exist or be cast deliberately.
