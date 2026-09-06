# llms.txt

Where: `src/pages/llms.txt.ts`, `src/pages/api/agents/llms-txt/generate.ts`, `src/features/agents/{llms-txt,generate-llms-txt}.ts`.

## Serving

`/llms.txt` returns the published `site.agents.llmsTxt` verbatim as
`text/plain`, or 404 while `site.agents.serveLlmsTxt` is off. It is never
generated on the fly, and a draft never leaks.

## Generating (Studio button)

The Site document's Agents tab has a Generate button that POSTs to
`/api/agents/llms-txt/generate` on the same origin. The endpoint:

1. Requires a same-origin request (`Origin`/`Referer` vs `PUBLIC_URL` or the
   request origin) and `SANITY_API_EDIT_TOKEN`.
2. Reads `AGENT_INVENTORY_QUERY` with drafts overlaid (same visibility rules as
   the sitemap: published, indexable, not password protected) and builds
   `{ title, url, excerpt }` entries in code.
3. Calls `writeClient.agent.action.generate` with `LLMS_TXT_INSTRUCTION`, the
   inventory, site name, tagline and `site.agents.llmsTxtGuidance` as constant
   params, `target: agents.llmsTxt`, `noWrite: true`.
4. Validates every URL in the output against the inventory; anything else is a
   422 `invalid-urls`.
5. Writes `agents.llmsTxt` on `drafts.site` when the draft exists and returns
   `{ llmsTxt }` so the Studio input fills the field.

Requirements: deploy the schema once (`npx sanity schema deploy`); the schema
id is `_.schemas.default` (workspace name `default`). Agent Actions is a paid
Sanity feature on some plans.
