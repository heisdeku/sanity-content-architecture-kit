---
name: agents-layer
description: The AI-agent surface (llms.txt, per-page Markdown negotiation, agent 404 map, openapi.json, generators). Use when working on anything agents read or on the Generate buttons.
---

# Agents layer

Files: `src/features/agents/*`, `src/middleware.ts`, `src/pages/{llms.txt,openapi.json}.ts`,
`src/pages/api/agents/**`.

- `/llms.txt` serves the published `site.agents.llmsTxt` verbatim, 404 unless
  `site.agents.serveLlmsTxt`. Never generate on the fly.
- Markdown negotiation lives in the middleware: `acceptsMarkdown(Accept)` short-circuits
  browsers on the first character; agents get the stored `agents.markdown` when
  `serveMarkdown` is on, the document is published and not password protected. Unknown
  paths return 404 with `notFoundMarkdown`.
- `POST /api/agents/markdown/generate { id }` runs the deterministic serializer
  (`serialize-markdown.ts`) over the resolved document and writes `agents.markdown` on the
  draft. No per-section branching: it renders by factory name. Project fields go in the
  labelled extension point.
- `POST /api/agents/llms-txt/generate` reads `AGENT_INVENTORY_QUERY`, builds
  `{ title, url, excerpt }` in code, calls `writeClient.agent.action.generate` with
  `site.agents.llmsTxtGuidance` as the instruction and the inventory as a constant param,
  then validates every URL in the output against the inventory before writing
  `site.agents.llmsTxt` on the draft.
- Generate endpoints require same-origin (Origin/Referer vs `PUBLIC_URL`) and the edit token.
- `/openapi.json` is built by `openapi.ts` from `site.name`; keep it in sync when you add a
  public endpoint.
- Test with `curl -H "Accept: text/markdown" http://localhost:4321/`.
