# Studio structure

`sanity.config.ts` is byte-identical between editions: it imports only from
packages and `./sanity/...`. Env comes from `sanity/config/env.ts`, which reads
`NEXT_PUBLIC_*`, then `PUBLIC_*`, then `SANITY_STUDIO_*` (guarded for both
`process.env` and `import.meta.env`).

## Desk (`sanity/structure/structure.ts`)

Top level, in this order, nothing else:

1. Homepage (singleton, id `homepage`)
2. Pages
3. Articles → All articles, Categories
4. Legal
5. Submissions (read-only, newest first)
6. Site (singleton, id `site`)
7. divider
8. Media library (image assets), Videos (Mux assets)

Tools: Structure, Presentation, Vision (only when `isDevelopment`), plus the
Media browser (`sanity-plugin-media`) and Mux uploads (`sanity-plugin-mux-input`).
`@sanity/assist` is enabled for AI assistance in the editor.

## Singletons (`sanity/structure/singleton-plugin.ts`)

There is no `singleton: true` option in Sanity; singletons are enforced by:

- pinning the id in the structure (`S.document().documentId('homepage')`),
- `schema.templates` filtering singleton (and `submission`) templates out,
- `document.newDocumentOptions` hiding them from the global "new document" menu,
- `document.actions` removing create, duplicate, delete and unpublish for them.

`filterSingletonTemplates` and `singletonDocumentActions` are exported so the
config applies them inline; `singletonPlugin()` bundles the same rules.

## Presentation (`sanity/presentation/resolve.ts`)

- `locations`: where a document appears (homepage `/`, page `uri`, article
  `/articles/<slug>`, legal `/legal/<slug>`, site → homepage).
- `mainDocuments`: which document owns a preview URL (`/`, `/articles/:slug`,
  `/legal/:slug`, `/:uri*`).
- `previewUrl`: `origin` from `appOrigin`, draft mode toggled through
  `/api/draft-mode/enable` and `/api/draft-mode/disable`.

## Custom inputs (`sanity/components/`)

| component | used by | what it does |
|-----------|---------|--------------|
| `link-input.tsx` | `appLink` | hides kinds/label according to the factory options |
| `media-input.tsx` | `appMedia` | hides kinds/custom ratio according to the factory options |
| `generate-media-dimensions-input.tsx` | `appLottie`, `appRive` | "Generate dimensions" reads width/height from the file |
| `generate-markdown-input.tsx` | `agents.markdown` | "Generate from page content" → `POST /api/agents/markdown/generate` `{ id }` → `{ markdown }` |
| `generate-llms-txt-input.tsx` | `site.agents.llmsTxt` | "Generate from site content" → `POST /api/agents/llms-txt/generate` → `{ llmsTxt }` |
| `uri-input.tsx` | `uri` | shows the full public URL under the slug input |
| `preview-media.tsx` | `appMedia` preview | image thumbnail, or Mux thumbnail for video |

All components use `@sanity/ui` and the `set`/`unset` patch helpers from `sanity`.

## Scripts

| script | what it does |
|--------|--------------|
| `npm run sanity:project-setup` | interactive: project, dataset, viewer + editor tokens, CORS, revalidate webhook (projection `{ _type, _id, "uri": coalesce(uri.current, slug.current) }`), `.env`, seed import. Every remote step is skippable and prints the manual equivalent on failure |
| `npm run sanity:backup [-- --dataset x] [--no-assets]` | `sanity dataset export` to `backups/<dataset>-<date>.tar.gz` |
| `npm run sanity:copy-dataset -- --from a --to b` | server-side copy, falling back to export + import |
| `npm run sanity:typegen` | `sanity schema extract --enforce-required-fields` + `sanity typegen generate` |
