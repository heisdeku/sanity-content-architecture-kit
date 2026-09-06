# Agent 404 (Markdown recovery map)

Where: `src/features/agents/not-found-markdown.ts`, `src/features/agents/serve-markdown.ts` (`buildNotFound`), `src/pages/api/agents/not-found.ts`.

When an agent asks for Markdown at a path with no document, it receives a 404
whose body is a Markdown map instead of an HTML shell: the site name, the
requested path, links to `/llms.txt` (when served), `/sitemap.xml` and
`/openapi.json`, a note about `Accept: text/markdown`, and the top indexable
pages from `AGENT_INVENTORY_QUERY`. `/api/agents/not-found?path=...` returns the
same map on demand.

Real 404s for HTML come from the routes: `[...uri].astro`, `articles/[slug].astro`
and `legal/[slug].astro` `return Astro.rewrite('/404')` when no document
matches, and `404.astro` sets `Astro.response.status = 404` before rendering
`site.notFound` (with a static fallback), so agents never receive a 200 shell.

## When Sanity is unreachable

The eligibility read cannot tell whether a document exists, so the middleware
serves a 503 `text/markdown` discovery map (same links, an "unavailable" intro)
with `private, no-store`, and the HTML routes rewrite to the 404 page, which
shows the Connect Sanity block instead of the editor's 404 content. Neither
response enters the route cache: `trySanityFetch` calls `cache.set(false)`
on failure so an outage is never stored until the next publish.
