# AGENTS.md

Rules for anyone (human or agent) working in this edition. The spec is
`../docs/architecture.md`; when this file and the spec disagree, the spec wins.

## This is Next.js 16, not the one you remember

APIs, conventions and file names differ from older training data. Before
writing framework code, read the relevant guide in
`node_modules/next/dist/docs/` (if present). Highlights you will hit:

- `proxy.ts` replaced `middleware.ts`. It runs on the Node runtime.
- `revalidateTag(tag, profile)` takes two arguments; use `"max"`.
- `draftMode()`, `headers()`, `cookies()`, `params` and `searchParams` are async.
- `<ViewTransition>` comes from `react` with no config flag.
- `typedRoutes` is stable and on: `href` values are type-checked.
- The React Compiler is on; do not add manual `useMemo`/`useCallback`.

## Layout

```
app/        routes only. Fetch, then render a feature component. Nothing else.
            (site)/ holds the public routes and the site shell layout; the root
            layout is fonts + globals so /studio renders bare.
features/   one folder per concern. Kebab-case files. No index barrels.
sanity/     decoupled Studio workspace. Relative imports only inside it.
proxy.ts    basic auth, redirects, markdown negotiation, real 404s. Fixed order.
env.ts      the ONLY place process.env is read.
```

Import what you need by file: `@/features/sanity/fetch`, never `@/features/sanity`.
The app may import from `sanity/` (queries, types, constants). `sanity/` never
imports from `app/` or `features/`.

## Components

- Server components by default. `"use client"` only where state, effects or
  browser APIs are needed, and as low in the tree as possible.
- Composition first: compound components (`Form.Field`, `Stagger.Item`) and
  children over boolean props. One component per file.
- Every media box reserves its size with `aspect-ratio` from the data.
- Copy: no em dashes. Field descriptions under 60 characters.

## Content rules (sanity/)

- Primitives only enter a schema through factories in `sanity/schemas/fields/`.
  They emit fixed object types: `appLink`, `appMedia`, `appRichText`, `appSeo`,
  `appHeading`, `appIcon`. The serializer and the frontend rely on the names.
- Sections are a closed set: `SECTION_TYPES` in `sanity/config/constants.ts`.
- Document roles are contracts (§3.1). Do not add fields to `page` that belong
  to `site`.

## Add a section

Use the generator, then fill in the blanks:

```
npm run plop section Testimonials
npm run sanity:typegen
```

It creates `sanity/schemas/sections/section-testimonials.ts`, registers it in
`sanity/schemas/index-registry.ts` and `SECTION_TYPES`, adds a projection in
`sanity/queries/fragments/sections.ts`, creates
`features/page-builder/sections/testimonials.tsx` and registers it in
`features/page-builder/page-builder.tsx`. See `docs/features/scaffolding.md`
for the anchors it relies on. The Markdown serializer needs no change if the
section uses factories.

## Add a document type

1. Schema in `sanity/schemas/documents/<name>.ts`, register in `index-registry.ts`.
2. If it owns a route: add it to `ROUTED_DOCUMENT_TYPES` and `ROUTE_NAMESPACES`,
   give it `createSeoField`, `createAgentsFields`, `createSecurityFields`.
3. Queries in `sanity/queries/documents/<name>.ts` with `defineQuery`.
4. Structure entry in `sanity/structure/structure.ts`; Presentation locations
   in `sanity/presentation/resolve.ts`.
5. Route in `app/<namespace>/[slug]/page.tsx` using `sanityFetch` with tags,
   `generateMetadata` from `features/site/metadata.ts`, `notFound()` on miss.
6. Add it to the sitemap query and the agent inventory query.
7. `npm run sanity:typegen`.

## Fetch layer

- Always `sanityFetch({ query, params, tags })`. Tags are required. Build them
  with `features/sanity/tags.ts`; `type:site` is appended automatically.
- Never `revalidate: N`. Published fetches are `force-cache` + `revalidate: false`
  and get busted by `/api/revalidate` through tags.
- Draft mode switches to the token client, `perspective: "drafts"`, stega on,
  `cache: "no-store"`.
- Every route that fetches exports `const dynamic = "force-dynamic"`. In Next 16
  `draftMode()` alone does not opt out of prerendering, and the build must never
  call Sanity.
- `useCdn` is false in production, true in development (`SANITY_USE_CDN` overrides).
- Metadata routes (`sitemap.ts`, `robots.txt`, `feed.xml`, `llms.txt`,
  `openapi.json`, `og`) are `force-dynamic` so `next build` never calls Sanity.
- No `generateStaticParams`.

## Proxy order

1. Pass-through: assets, `/_next`, `/studio`, `/api/*` (the internal markdown
   route is blocked from direct access).
2. Basic auth (site-wide toggle beats per-document; credentials from env; fails
   open with a warning when the CMS is unreachable).
3. CMS redirects.
4. Markdown negotiation: `Accept: text/markdown` rewrites to `/api/agents/markdown`.
5. Real 404s from the routed inventory.

Only `fetch` and Web APIs in `proxy.ts` and `features/site/proxy-lookups.ts`.

## Env

- Add a variable to `env.ts` (server or client schema), `.env.example` (with a
  one-line comment) and, if the Studio needs it, `sanity/config/env.ts`.
- Never read `process.env` elsewhere.
- The build must pass with `.env.example` values and no network.

## Verify

```
npm run check       # biome, writes fixes
npm run typecheck   # tsc --noEmit
npm run build
```

Then run `npm run dev` and curl `/`, `/llms.txt`, `/robots.txt`,
`/openapi.json`, an unknown path (expect 404), and `/` with
`Accept: text/markdown`. See `.claude/skills/verify-in-browser/SKILL.md`.

## Git

Conventional commits (`type(scope): subject`), enforced by commitlint through
lefthook. Biome runs on staged files before every commit.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
