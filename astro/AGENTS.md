# AGENTS.md (Astro edition)

Read `../docs/architecture.md` first; it wins over anything here. This file is
the Astro-specific supplement. Scoped how-tos live in `.claude/skills/*/SKILL.md`.

## Layout

- `src/pages/` routes only, thin: fetch through the feature layer, set cache
  tags, render. `.astro` pages and `.ts` endpoints.
- `src/features/<name>/` feature modules, kebab-case files, no index barrels.
  Import the file you need: `@/features/sanity/fetch`.
- `src/layouts/base-layout.astro` the page shell (head metadata, header,
  footer, draft banner, visual editing, view transitions).
- `src/middleware.ts` Basic Auth, redirects, Markdown negotiation, in that order.
- `src/env.ts` the only place env is read (`@t3-oss/env-core`). Islands get
  public values as props. The middleware reads `import.meta.env` directly for
  the Basic Auth credentials and says why.
- `sanity/` the studio workspace, byte-identical to `../next-js/sanity`.
  Relative imports only inside it; never import `src/` from it. The framework
  imports queries, types and constants from it via `@studio/*`.

## .astro vs islands

- Static rendering in `.astro`. React (`.tsx`) only for interactivity:
  the contact form, Mux player, Lottie, Rive, motion `Reveal`/`Stagger`.
  Mount islands with `client:visible` unless they must run immediately.
- Components are composition-first (compound `Form.*`, children over boolean
  props). No mega-components.
- Lucide icons render server-side from `.astro` through `features/page-builder/icon.tsx`.

## Fetch layer and cache

- Always `sanityFetch` / `trySanityFetch` from `src/features/sanity/fetch.ts`
  with `tags` and `cache: Astro.cache`. `type:site` is added automatically.
- Astro caches responses, not fetches. `Astro.cache.set({ tags })` marks the
  response; `/api/revalidate` busts tags with `cache.invalidate`. Never rely on
  `maxAge` alone for content pages.
- Draft mode (`Astro.locals.draft`) switches to the drafts perspective and
  disables the route cache. Draft, Basic Auth and Markdown responses are
  `private, no-store`; every HTML response varies on `Cookie, Authorization, Accept`.
- `useCdn` is false in production, true in development (`SANITY_USE_CDN` overrides).

## Adding things

- Section: `npm run plop section <Name>` then `npm run sanity:typegen`.
- Document type: follow `.claude/skills/add-document-type`.
- Route: `npm run plop route`; handle `null` data with `ConnectSanity`, unknown
  documents with `return Astro.rewrite('/404')`.
- Env var: add it to `.env.example` and `src/env.ts` in the same change.

## Rules

- Descriptions in schemas under 60 characters, no em dashes, say what to enter.
- No em dashes anywhere in copy.
- Errors from `/api/*` use `apiError(status, code, message, hint)`.
- Biome-clean: `npm run check`.
- Never commit `.env`, `backups/`, or planning documents.

## Verify before you say it is done

```
npm run check
npm run typecheck
npm run build
```

Then `npm run dev` and the curl checks in `.claude/skills/verify-in-browser`.
