---
name: add-document-type
description: Add a new Sanity document type, optionally with its own public route, Studio structure entry and Presentation wiring. Use when the content model needs a new kind of document.
---

# Add a document type

Read `../docs/architecture.md` §3.1 and `docs/features/schema.md`.

## Decide the role first

Route owner (like `page`), namespaced entry (like `article`), taxonomy (like
`category`), record (like `submission`) or global config (belongs in `site`,
do not add a document). Write the role in the schema file comment.

## Steps

1. `sanity/schemas/documents/<name>.ts` with `defineType`. Use factories for
   every primitive. Routed documents get `createSeoField`,
   `createAgentsFields`, `createSecurityFields` and either `createUriField`
   (full path) or `createSlugField` (namespaced).
2. Register it in `sanity/schemas/index-registry.ts` (documents block).
3. Routed: add to `ROUTED_DOCUMENT_TYPES` and `ROUTE_NAMESPACES` in
   `sanity/config/constants.ts`; extend `getDocumentPath` in
   `sanity/lib/document-path.ts` if the path rule is new; extend
   `DOCUMENT_PATH_PROJECTION` and the filters in
   `sanity/queries/documents/agents.ts` so the sitemap, llms.txt and the
   proxy inventory see it.
4. Queries in `sanity/queries/documents/<name>.ts` with `defineQuery`.
5. Structure: add a list in `sanity/structure/structure.ts` at the right
   position (order is fixed, see `docs/features/studio-structure.md`).
   Presentation: add `mainDocuments` and `locations` in
   `sanity/presentation/resolve.ts`.
6. Route: `app/<namespace>/[slug]/page.tsx` (see the `add-route` skill).
7. `npm run sanity:typegen`, then `npm run check && npm run typecheck`.
8. Seed: add an example document to `seed/seed.ndjson` if the kit should
   ship one.
