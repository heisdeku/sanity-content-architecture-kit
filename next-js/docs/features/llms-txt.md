# llms.txt

A Markdown index of the site for language models, owned by editors.

## Serving (`app/llms.txt/route.ts`)

- 404 unless `site.agents.serveLlmsTxt` is true.
- Serves the **published** `site.agents.llmsTxt` verbatim as `text/plain`.
  Drafts never appear here.
- `force-dynamic`; cached by the Data Cache with `type:site`.

## Generating (`app/api/agents/llms-txt/generate/route.ts`)

The Site document's Agents tab has a Generate button
(`sanity/components/generate-llms-txt-input.tsx`) that POSTs `{ id }`.

1. The handler checks the request is same-origin (Origin or Referer matches
   `NEXT_PUBLIC_URL`). The Studio runs in the browser, so a bearer token
   cannot be kept secret there; same-origin plus the server-held edit token
   is the trade-off. Lock the Studio behind basic auth or Sanity login for
   stronger guarantees.
2. `features/agents/generate-llms-txt.ts` reads `AGENT_INVENTORY_QUERY`
   (drafts overlaid, same visibility rules as the sitemap) and builds
   `{ title, url, excerpt }` entries in code.
3. It calls `client.agent.action.generate` with the guidance field as the
   instruction and the inventory as an `instructionParams` constant, targeting
   `agents.llmsTxt` on the site document. Agent Actions write to the draft.
4. Every URL in the output is validated against the inventory. Unknown URLs
   fail the request; the model never invents a link.
5. The handler returns `{ llmsTxt }` and the Studio writes it into the field.

Requires `SANITY_API_EDIT_TOKEN` and a deployed schema
(`npx sanity schema deploy`) because Agent Actions read the schema by id.
