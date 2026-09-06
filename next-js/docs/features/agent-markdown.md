# Per-page Markdown for agents

Every routed document answers in Markdown on its own URL when a client sends
`Accept: text/markdown`. Browsers keep getting HTML.

## Serving

1. `proxy.ts` step 4: `acceptsMarkdown(accept)` fails fast on the first
   `includes("markdown")` check for browsers. For agents it compares q-values
   and rewrites to `/api/agents/markdown?path=<path>` with the internal
   `x-agent-markdown: 1` header.
2. `app/api/agents/markdown/route.ts` refuses requests without that header,
   runs `MARKDOWN_BY_PATH_QUERY` (published perspective), and returns the
   stored `agents.markdown` when `serveMarkdown` is true and the document is
   not password protected. Content type `text/markdown; charset=utf-8`.
3. No document, or serving disabled: 404 with the recovery map from
   `features/agents/not-found-markdown.ts`.

## Generating

The Agents tab on every routed document has a Generate button
(`sanity/components/generate-markdown-input.tsx`) that POSTs `{ id }` to
`/api/agents/markdown/generate`. The handler checks same-origin, loads the
document with drafts overlaid, runs the deterministic serializer and returns
`{ markdown }`. The editor reviews and publishes.

## The serializer (`features/agents/serialize-markdown.ts`)

It walks any object recursively and renders by factory name:

| `_type` | Markdown |
|---------|----------|
| `appHeading` | `##` heading at the stored level |
| Portable Text arrays | headings, lists, quotes, marks, links |
| `appMedia` | `![alt](url)` for images, a link for video |
| `appLink`, `appButton` | `[label](absolute url)` |

String conventions cover `eyebrow`, `title`, `description`, `question`,
`answer`, `caption`, `quote`. Arrays recurse. Presentation-only keys
(`layout`, `variant`, `align`, dimensions) are skipped.

There is no per-section branching, so a new section built from the factories
serializes with no change here. Project-specific types go in the one labelled
extension point, `PROJECT_SERIALIZERS`.

Why deterministic and not an LLM: content negotiation promises the same page
faithfully. A model paraphrases; the serializer emits the content one to one.
