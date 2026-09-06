---
name: agents-layer
description: Work on llms.txt, per-page Markdown, the Markdown serializer, agent 404s or openapi.json. Use when changing how agents read the site.
---

# Agents layer

Read `docs/features/llms-txt.md`, `docs/features/agent-markdown.md`,
`docs/features/agent-404.md` and `docs/features/openapi.md`.

## Map

| Concern | File |
|---------|------|
| Accept detection | `features/agents/accepts-markdown.ts` |
| Serializer | `features/agents/serialize-markdown.ts` (+ `portable-text-to-markdown.ts`) |
| Serve stored Markdown | `app/api/agents/markdown/route.ts` |
| Generate Markdown | `app/api/agents/markdown/generate/route.ts` |
| llms.txt serve | `app/llms.txt/route.ts` |
| llms.txt generate | `features/agents/generate-llms-txt.ts`, `app/api/agents/llms-txt/generate/route.ts` |
| 404 map | `features/agents/not-found-markdown.ts`, `app/api/agents/not-found/route.ts` |
| OpenAPI | `features/agents/openapi.ts`, `app/openapi.json/route.ts` |
| Proxy rewrite | `proxy.ts` step 4 |

## Rules

- The serializer renders by factory name. Never add a `switch (section._type)`.
  A project-specific object goes in `PROJECT_SERIALIZERS`, the single labelled
  extension point.
- Serving reads published content only. Generation reads drafts overlaid.
- URLs never pass through a model. Build them in code and validate the
  output against the inventory.
- Generate routes require same-origin (Origin/Referer against `NEXT_PUBLIC_URL`).
- The markdown serve route is only reachable through the proxy rewrite; keep
  the `x-agent-markdown` header check.

## Verify

```
curl -s -H 'Accept: text/markdown' localhost:3000/ | head -20
curl -s -o /dev/null -w '%{http_code}\n' -H 'Accept: text/markdown' localhost:3000/nope
curl -s -i localhost:3000/llms.txt | head -3
```
