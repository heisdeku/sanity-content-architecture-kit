# Agent 404s

An agent that hits an unknown URL should get a real `404`, not a `200` shell,
and a hint about where to look next.

- `proxy.ts` step 5 checks the path against the routed inventory
  (`features/site/proxy-lookups.ts`). Unknown paths are rewritten to a
  non-existent route, so Next renders `app/not-found.tsx` with a 404 status
  before streaming.
- Routes also call `notFound()` when their query returns nothing, which
  covers the case where the inventory cache is stale.
- Markdown clients (`Accept: text/markdown`) receive the recovery map from
  `features/agents/not-found-markdown.ts`: links to `/llms.txt`,
  `/sitemap.xml`, `/openapi.json` and the top pages, served by
  `app/api/agents/not-found/route.ts` and by the markdown handler when no
  document matches.
- Humans see `app/not-found.tsx`, whose copy comes from `site.notFound`
  with a built-in fallback.
