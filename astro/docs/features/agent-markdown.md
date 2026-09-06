# Per-page Markdown for agents

Where: `src/middleware.ts`, `src/features/agents/{accepts-markdown,serve-markdown,serialize-markdown}.ts`, `src/pages/api/agents/markdown.ts`, `src/pages/api/agents/markdown/generate.ts`.

## Negotiation

A request whose `Accept` header prefers `text/markdown` over `text/html`
receives the page's stored Markdown on the same URL. `acceptsMarkdown` fails on
the first character for browsers (`text/html,...`) so normal traffic pays
nothing. The middleware then calls `decideMarkdown(path)`:

- `markdown`: `agents.serveMarkdown` is on, the document is published, not
  password protected and has Markdown. Rewritten to `/api/agents/markdown`,
  served as `text/markdown; charset=utf-8`, `public, s-maxage=60,
  stale-while-revalidate=600`, tagged like the page.
- `not-found`: no document at the path. 404 with the Markdown recovery map.
- `html`: document exists but Markdown is off or empty. The HTML page is served.
- `unavailable`: Sanity could not be reached. A 503 Markdown discovery map, never cached.

Eligibility reads hit a 60 s in-memory cache cleared by `/api/revalidate`.
`/api/agents/markdown` is not reachable directly (404 from the middleware).

## Generating (Studio button)

Every routed document has an Agents tab with a Generate button that POSTs
`{ id }` to `/api/agents/markdown/generate`. The endpoint reads
`DOCUMENT_FOR_SERIALIZER_QUERY` (raw perspective, the draft when the Studio
sent a draft id) and runs the deterministic serializer.

`serialize-markdown.ts` walks any object recursively and renders by factory
name: `appHeading`, `appRichText`, `appMedia` (image as `![alt](url)`, video
and animations as links), `appLink` and `appButton` (absolute URLs), plus the
`title` / `eyebrow` / `description` string conventions, FAQ items
(`question` / `answer`) and logo arrays. There is no per-section branching, so a
new section built from factories serializes with no new code. Project-specific
objects go in the single labelled extension point (`renderProjectSpecific`).

Test: `curl -H "Accept: text/markdown" http://localhost:4321/`.
