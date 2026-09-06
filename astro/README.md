# Content Architecture Kit, Astro edition

An open-source Astro 7 + Sanity starter built on the decisions described in
[The Content Architecture](https://contentarchitecture.dev) series: explicit
document roles, factory-built primitives, a closed page-builder set, a fetch
layer that does not drift, and an agent layer that serves llms.txt and
per-page Markdown. The `sanity/` workspace is byte-identical to the Next.js
edition in `../next-js`; only the framework layer differs.

Read [`docs/architecture.md`](../docs/architecture.md) first. It is the single
source of truth for both editions.

## Features

- **Studio embedded at `/studio`** through `@sanity/astro`, with Structure,
  Presentation (visual editing with stega) and Vision (dev only).
- **Document roles as contracts**: homepage singleton, pages that own full
  paths, articles under `/articles`, legal pages under `/legal`, read-only
  submissions, and a Site singleton for navigation, SEO defaults, redirects,
  security, agents, the 404 page and notifications.
- **Field factories** (`createLinkField`, `createMediaField`,
  `createRichTextField`, `createSeoField`, `createPageBuilderField`, ...) with
  fixed object names the frontend and the Markdown serializer rely on.
- **Page builder**: nine sections, one `.astro` renderer each, whitelists and
  blacklists per document type, spacing owned by design tokens.
- **Media with zero layout shift**: one field, four kinds (image, Mux video,
  Lottie, Rive), dimensions always present so every box is reserved.
- **Fetch layer**: `sanityFetch({ query, params, tags, draft, cache })`, CDN off
  in production, drafts perspective in draft mode, `Astro.cache` tags on every
  response and tag invalidation from the Sanity webhook.
- **Middleware**: Basic Auth (site-wide or per document, env credentials),
  CMS-managed redirects, Markdown content negotiation, real 404s.
- **Agent layer**: `/llms.txt` owned by editors and drafted with Sanity Agent
  Actions, per-page Markdown on the same URL via `Accept: text/markdown`,
  a Markdown recovery map for 404s, `/openapi.json`.
- **SEO**: metadata inheritance (document overrides site defaults field by
  field), OG images cropped to 1200x630, JSON-LD, sitemap, RSS, robots.txt with
  a Content-Signal line.
- **Forms**: contact form island (react-hook-form + zod), honeypot, HMAC timing
  token, rate limit, `submission` documents, Resend notifications.
- **Frontend**: Tailwind 4 with `@theme` tokens, Geist variable fonts, view
  transitions, Lenis smooth scroll, `motion` islands, Umami analytics.
- **Tooling**: Node 24, TypeScript strict, Biome 2, lefthook + commitlint,
  plop generators (`section`, `route`, `feature`), Sanity scripts
  (project setup, backup, copy dataset, typegen), `.mcp.json` with the
  chrome-devtools and Sanity MCP servers, scoped skills in `.claude/skills`.

## Getting started

See [GETTING-STARTED.md](./GETTING-STARTED.md) for the full walkthrough.

### Prerequisites

- Node 24 (`.nvmrc`, `engines`, `engine-strict`)
- npm
- A Sanity account (free tier is enough); `npm run sanity:project-setup` creates the project

### Installation

```bash
cd astro
cp .env.example .env
npm install
npm run dev            # http://localhost:4321, Studio at /studio
```

With the placeholder project id the site renders a "Connect Sanity" empty
state instead of failing. Run `npm run sanity:project-setup` to create a real
project, mint tokens, register the revalidate webhook, write `.env` and import
the seed dataset.

### Environment variables

| name | purpose |
|---|---|
| `PUBLIC_URL` | canonical origin, used for absolute URLs and same-origin checks |
| `PUBLIC_SANITY_PROJECT_ID`, `PUBLIC_SANITY_DATASET` | Sanity project |
| `PUBLIC_SANITY_API_VERSION` | API version (`2025-02-19`) |
| `PUBLIC_SANITY_STUDIO_BASE_PATH` | where the Studio mounts (`/studio`) |
| `SANITY_API_VIEW_TOKEN` | viewer token for draft mode and Presentation |
| `SANITY_API_EDIT_TOKEN` | editor token for submissions and agent writes |
| `SANITY_REVALIDATE_SECRET` | webhook signature secret |
| `SANITY_USE_CDN` | optional override of the CDN default |
| `BASIC_AUTH_USER`, `BASIC_AUTH_PASSWORD` | Basic Auth credentials |
| `FORM_SECRET` | HMAC key for the form timing token |
| `RESEND_API_KEY`, `RESEND_FROM` | contact form notifications |
| `PUBLIC_UMAMI_WEBSITE_ID`, `PUBLIC_UMAMI_SRC` | analytics |
| `MUX_TOKEN_ID`, `MUX_TOKEN_SECRET` | Mux plugin in the Studio |

All reads go through `src/env.ts` (`@t3-oss/env-core`). Set
`SKIP_ENV_VALIDATION=1` to bypass validation in one-off scripts.

### Scripts

| script | what it does |
|---|---|
| `npm run dev` | Astro dev server with the embedded Studio |
| `npm run build` / `npm run preview` | production build with the Vercel adapter |
| `npm run check` | Biome lint + format (writes fixes) |
| `npm run lint` | Biome without writing |
| `npm run typecheck` | `astro check` |
| `npm run plop` | generators: `section`, `route`, `feature` |
| `npm run sanity:typegen` | extract the schema and generate `sanity/sanity.types.ts` |
| `npm run sanity:project-setup` | create project, dataset, tokens, CORS, webhook, `.env`, seed |
| `npm run sanity:backup` | export the dataset to `backups/<date>.tar.gz` |
| `npm run sanity:copy-dataset` | copy a dataset (`--from`, `--to`) |

## Layout

```
astro/
  src/pages/         routes (.astro pages + .ts endpoints), thin
  src/features/      feature modules (agents, sanity, site, page-builder, ...)
  src/layouts/       base-layout.astro
  src/middleware.ts  basic auth, redirects, markdown negotiation
  src/env.ts         the only place env is read
  sanity/            studio workspace, byte-identical to ../next-js/sanity
  docs/features/     one doc per feature
  .claude/skills/    scoped skills for agents
```

## Verification

```bash
npm run check && npm run typecheck && npm run build
```

Both editions must pass from a clean clone with `.env.example` copied to
`.env` and placeholder Sanity ids. See `.claude/skills/verify-in-browser`.

## License

MIT, see [LICENSE.md](./LICENSE.md).
