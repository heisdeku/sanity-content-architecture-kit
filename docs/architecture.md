# Architecture spec

This document is the single source of truth for both editions of the kit
(`next-js/` and `astro/`). Every agent and every human working on the kit
builds inside these decisions. When the two editions disagree, this file wins.

The kit is an original reconstruction of the publicly described architecture
of "The Content Architecture" (contentarchitecture.dev). It reproduces the
_decisions_ (schema roles, factories, fetch layer, agent layer), not any
proprietary code. License: MIT.

## 1. Repository layout

```
content-architecture-kit/
  README.md                 overview, which edition to pick
  docs/architecture.md      this file
  next-js/                  Next.js 16 edition (standalone app, own package.json)
  astro/                    Astro 7 edition   (standalone app, own package.json)
```

Both editions are standalone. They do not share code at runtime. The `sanity/`
folder is **byte-identical** in both editions (it is authored once and copied),
which is why it must be fully decoupled (see §3).

### 1.1 Next.js edition

```
next-js/
  app/                      App Router routes only (thin: fetch + render)
    layout.tsx, page.tsx (homepage), not-found.tsx, error.tsx, globals.css
    [...uri]/page.tsx       page documents (full-path routes)
    articles/page.tsx, articles/[slug]/page.tsx
    legal/[slug]/page.tsx
    studio/[[...tool]]/page.tsx
    sitemap.ts, robots.ts, feed.xml/route.ts, llms.txt/route.ts, openapi.json/route.ts
    og/route.tsx            auto-cropped OpenGraph image
    api/revalidate/route.ts
    api/draft-mode/enable/route.ts, api/draft-mode/disable/route.ts
    api/contact/route.ts
    api/agents/markdown/route.ts            serves stored per-page Markdown (used by proxy rewrite)
    api/agents/markdown/generate/route.ts   deterministic serializer -> writes field (Studio button)
    api/agents/llms-txt/generate/route.ts   Sanity Agent Actions -> writes field (Studio button)
    api/agents/not-found/route.ts           Markdown recovery map for agent 404s
  features/                 feature modules (see §2)
  sanity/                   decoupled studio workspace (see §3)
  public/
  scripts/                  sanity-project-setup, backup, copy-dataset, generate-openapi
  seed/                     seed dataset (ndjson + assets) imported by project-setup
  templates/ + plopfile.mjs plop generators: section, route, feature
  docs/features/*.md        per-feature docs
  .claude/skills/*/SKILL.md scoped skills (see §12)
  AGENTS.md, CLAUDE.md, GETTING-STARTED.md, README.md, LICENSE.md
  proxy.ts                  Next 16 proxy (middleware): basic auth, redirects, markdown negotiation, 404s
  env.ts                    @t3-oss/env-nextjs, the ONLY place process.env is read
  next.config.ts, biome.jsonc, lefthook.yml, commitlint.config.mjs, .mcp.json
  sanity.config.ts, sanity.cli.ts, sanity-typegen.json, sanity-schema.json
  .env.example, .nvmrc (24), .npmrc, tsconfig.json (strict)
```

### 1.2 Astro edition

```
astro/
  src/
    pages/                  same route surface as above (.astro + .ts endpoints)
      index.astro, [...uri].astro, 404.astro
      articles/index.astro, articles/[slug].astro
      legal/[slug].astro
      sitemap.xml.ts, robots.txt.ts, feed.xml.ts, llms.txt.ts, openapi.json.ts, og.ts
      api/revalidate.ts, api/draft-mode/enable.ts, api/draft-mode/disable.ts, api/contact.ts
      api/agents/markdown.ts, api/agents/markdown/generate.ts, api/agents/llms-txt/generate.ts, api/agents/not-found.ts
    features/               same feature modules, Astro/React flavoured
    layouts/base-layout.astro
    middleware.ts           basic auth, redirects, markdown negotiation, 404s
    env.ts                  @t3-oss/env-core (or astro:env), the ONLY place env is read
  sanity/                   byte-identical copy of next-js/sanity
  public/, scripts/, seed/, templates/, plopfile.mjs, docs/, .claude/skills/
  astro.config.mjs (adapter: @astrojs/vercel, output server, @sanity/astro with studioBasePath "/studio", @astrojs/react, tailwind via @tailwindcss/vite)
  sanity.config.ts, sanity.cli.ts, sanity-typegen.json, sanity-schema.json
  AGENTS.md, CLAUDE.md, GETTING-STARTED.md, README.md, LICENSE.md, biome.jsonc, lefthook.yml, ...
```

## 2. Feature modules

`features/<name>/` is the unit of organisation. Rules:

- **kebab-case** file names everywhere. `create-link-field.ts`, `page-builder.tsx`.
- **No index barrels.** Import the file you need: `@/features/sanity/fetch`.
- A feature owns its components, hooks, helpers and (framework) route handlers' logic.
  Route files in `app/` / `src/pages/` stay thin and delegate to the feature.
- Framework-only concerns live in the feature; content concerns live in `sanity/`.
- Frontend components follow composition-first patterns (compound components,
  children over boolean props). No mega-components with 10 boolean props.

| feature            | responsibility |
|--------------------|----------------|
| `agents`           | Markdown serializer (factory-name driven), llms.txt serving, agent 404 map, openapi document builder, Accept-header detection |
| `dom`              | `use-breakpoint` (wraps `@mantine/hooks` `useMediaQuery`), `constants.ts` (breakpoints matching Tailwind), `parse-responsive-values.ts`, `use-content-ready.ts` (fonts + images ready), `use-touch.ts` |
| `draft-mode`       | enable/disable logic, `DraftModeBanner`, Presentation/visual-editing wiring, `perspective` helper |
| `fonts`            | font loading (`next/font/local` in Next; `@font-face` + preload in Astro), CSS variables `--font-sans`, `--font-mono` |
| `forms`            | `ContactForm` (react-hook-form + zod, shared `contact-schema.ts`), submit handler that stores a `submission` doc and emails via Resend to `site.notifications.recipients` |
| `legal`            | legal page rendering (rich text + last updated) |
| `motion`           | `Reveal`, `Stagger`, `use-reduced-motion`; built on the `motion` package |
| `mux`              | `MuxVideo` (`@mux/mux-player-react`), poster/thumbnail URL helpers, autoplay-loop "background" mode |
| `page-builder`     | `PageBuilder` renderer + `sections/` registry (one component per section type, one file each), section spacing tokens |
| `rich-text`        | `RichText` renderer for `appRichText` (Portable Text), link annotation resolution, plain-text helper |
| `sanity`           | `client.ts`, `fetch.ts` (the fetch layer, §5), `image.ts` (`urlFor`, og crop), `resolve-link.ts` (appLink -> href), `tags.ts`, `webhook.ts` |
| `site`             | metadata builder (site defaults + document overrides), `Header`, `Footer`, `Navigation`, sitemap/robots/feed builders, redirects lookup, basic-auth helpers, `not-found` content |
| `spam-prevention`  | honeypot field + timing token (HMAC-signed render timestamp; reject < 3s and > 24h), rate-limit helper (in-memory, pluggable) |
| `style`            | `cn()` (clsx + tailwind-merge), design tokens in `globals.css` `@theme`, container/section spacing utilities |
| `umami`            | `<Umami />` script component gated by `NEXT_PUBLIC_UMAMI_*` / `PUBLIC_UMAMI_*` and a `track()` helper |
| `utils`            | `absolute-url.ts`, `format-date.ts`, `slugify.ts`, `assert-never.ts`, `is-defined.ts` |
| `view-transition`  | Next: `ViewTransitions` helpers on top of React `<ViewTransition>` (`experimental.viewTransition`); Astro: `<ClientRouter />` + transition names |
| `lenis`            | `lenis.tsx` smooth scroll provider (top-level file in `features/`, respects reduced motion) |

## 3. `sanity/` (decoupled studio workspace)

Rules:

- **Relative imports only** inside `sanity/`. Never `@/...`. Never import from
  `app/`, `src/`, or `features/`. It must be copy-pasteable between editions.
- The framework may import from `sanity/` (queries, types, constants). Never
  the other way round.
- Studio-side network calls to the app (Generate buttons) go through
  `fetch()` to a route on the same origin, configured via `sanity/config/env.ts`
  reading `process.env.SANITY_STUDIO_*` / `NEXT_PUBLIC_*` / `PUBLIC_*` with a
  documented fallback.

```
sanity/
  config/
    env.ts               projectId, dataset, apiVersion, studioBasePath, appOrigin
    constants.ts         document type names, singleton ids, section type names, ROUTE namespaces
  schemas/
    index-registry.ts    the schemaTypes array (explicit list, not a barrel of re-exports)
    fields/              factories (§4)
      create-link-field.ts, create-media-field.ts, create-rich-text-field.ts,
      create-seo-field.ts, create-page-builder-field.ts, create-uri-field.ts,
      create-heading-field.ts, create-icon-field.ts, create-eyebrow-field.ts,
      create-slug-field.ts, create-agents-fields.ts, create-security-fields.ts
    objects/             non-document object types the factories reference
      app-link.ts, app-media.ts, app-rich-text.ts, app-seo.ts, app-heading.ts,
      app-icon.ts, app-image.ts, app-lottie.ts, app-rive.ts, app-mux-video.ts,
      app-button.ts, navigation-item.ts, redirect.ts, faq-item.ts, logo-item.ts
    sections/            closed set, one file each, all use factories
      section-hero.ts, section-rich-text.ts, section-image-text.ts, section-cta.ts,
      section-logo-grid.ts, section-faq.ts, section-contact-form.ts,
      section-article-list.ts, section-media.ts
    documents/
      homepage.ts (singleton), page.ts, article.ts, category.ts, legal-page.ts,
      submission.ts (read-only), site.ts (singleton)
  structure/
    structure.ts         desk structure (§3.2)
    singleton-plugin.ts  locks singletons (no create/delete/duplicate)
    default-document-node.ts (preview panes)
  presentation/
    resolve.ts           locations + mainDocuments resolvers for Presentation
  components/            Studio input components
    generate-llms-txt-input.tsx, generate-markdown-input.tsx,
    generate-media-dimensions-input.tsx, uri-input.tsx, preview-*.tsx
  queries/               GROQ, `defineQuery` from "groq"
    fragments/
      link.ts (LINK_FRAGMENT), media.ts (MEDIA_FRAGMENT), rich-text.ts (RICH_TEXT_FRAGMENT),
      seo.ts (SEO_FRAGMENT), sections.ts (PAGE_BUILDER_FRAGMENT: one projection per section)
    documents/
      homepage.ts, page.ts (PAGE_BY_URI_QUERY, PAGE_URIS_QUERY), article.ts, legal.ts,
      site.ts (SITE_QUERY, SITE_SECURITY_QUERY, REDIRECTS_QUERY, LLMS_TXT_QUERY),
      agents.ts (MARKDOWN_BY_PATH_QUERY, AGENT_INVENTORY_QUERY), sitemap.ts (SITEMAP_QUERY)
  sanity.types.ts        generated by `sanity typegen generate` (committed)
  lib/                   pure helpers used by schemas/components (document-path.ts, portable-text-to-plain.ts)
```

### 3.1 Document roles (contracts)

| type          | role | route | notes |
|---------------|------|-------|-------|
| `homepage`    | singleton page | `/` | page-shaped (pageBuilder + seo), id `homepage`, cannot be created/deleted |
| `page`        | route owner | `uri` = full path, e.g. `/about`, `/pricing/enterprise` | tabs: Page (title, uri), Content (pageBuilder), SEO, Agents, Security |
| `article`     | publishing contract | `/articles/<slug>` | + excerpt, cover media, categories[], author, publishedAt; pageBuilder scoped to editorial sections |
| `category`    | taxonomy | none | title, slug, description |
| `legalPage`   | legal contract | `/legal/<slug>` | title, slug, body (appRichText), lastUpdated; pageBuilder blacklisted promotional sections |
| `submission`  | read-only record | none | name, email, message, page, userAgent, receivedAt; all fields readOnly |
| `site`        | global config singleton | none | id `site`; tabs: General (name, tagline, logo, defaultLocale), Navigation (header items, footer columns, social links), SEO (default appSeo, favicon set), Redirects (redirect[]), Security (basicAuth enabled), Agents (serveLlmsTxt, llmsTxtGuidance, llmsTxt), Not found (title, appRichText, appLink), Notifications (contact recipients[], fromAddress) |

Security: `site.security.basicAuthEnabled` gates the whole site. `page`/`article`/
`legalPage` carry `security.passwordProtect`. Site-wide wins. Credentials come
from env (`BASIC_AUTH_USER`, `BASIC_AUTH_PASSWORD`), never from the CMS.

Agents: `site.agents.{serveLlmsTxt, llmsTxtGuidance, llmsTxt}`. Every routed
document carries `agents.{serveMarkdown (default true), markdown}`.

### 3.2 Studio structure

Top level, in this order, nothing else:

1. Homepage (singleton)
2. Pages
3. Articles (+ Categories as a nested list)
4. Legal
5. Submissions (read-only list, newest first)
6. Site (singleton)
7. divider
8. Media library (sanity-plugin-media), Videos (Mux)

Tools: Structure, Presentation, Vision (dev only).

## 4. Field factories and guaranteed names

Every primitive is a factory returning a `defineField(...)`. Factories are the
only way primitives enter a schema. Each factory's object type has a fixed name
so the frontend and the Markdown serializer can rely on it:

| factory | object type | shape (frontend contract) |
|---------|-------------|---------------------------|
| `createLinkField({ name?, title?, group?, required?, noCustomText?, allowed?: LinkKind[] })` | `appLink` | `{ kind: 'internal' \| 'external' \| 'email' \| 'phone' \| 'file' \| 'params', label?, internal?: {_type, uri/slug}, href?, params?, newTab?, download? }` |
| `createMediaField({ name?, title?, group?, required?, allowed?: MediaKind[], withCustomRatio? })` | `appMedia` | `{ kind: 'image' \| 'video' \| 'lottie' \| 'rive', width, height, aspectRatio, alt?, image?, video? (mux playbackId, poster), lottie? (file url), rive? (file url, stateMachine?), customRatio? }` — dimensions always present for every kind |
| `createRichTextField({ name?, title?, group?, required?, styles?, marks?, allowImages?, allowMedia? })` | `appRichText` | Portable Text array, constrained styles/marks; link annotation uses `appLink` |
| `createSeoField({ group? })` | `appSeo` | `{ title?, description?, noIndex?, image? }`; inherits from `site.seo` |
| `createPageBuilderField({ group?, whitelist?, blacklist? })` | `appPageBuilder` (array) | ordered array of section objects; `whitelist`/`blacklist` filter the closed section set |
| `createUriField({ ... })` | `slug`-based, name `uri` | full path with leading slash, unique, validated regex |
| `createHeadingField({ name?, level?, max? })` | `appHeading` | `{ text, level? }`, max length enforced |
| `createEyebrowField()` | string | short label, max 60 |
| `createIconField()` | `appIcon` | `{ name }` from a fixed icon set (lucide) |
| `createAgentsFields()` | fieldset | `agents.serveMarkdown`, `agents.markdown` (with Generate input component) |
| `createSecurityFields()` | fieldset | `security.passwordProtect` |

Resolved shapes above are what the GROQ fragments project; the frontend never
reshapes them.

Field descriptions: under 60 characters, no em dashes, say what to enter.

## 5. Fetch layer (the part that must not drift)

```
useCdn: production=false, development=true (SANITY_USE_CDN override allowed)
perspective: 'published' normally, 'drafts' in draft mode (with token, useCdn=false, no cache)
```

Next.js `features/sanity/fetch.ts`:

```ts
sanityFetch({ query, params, tags })  // tags REQUIRED
// published: client.fetch(query, params, { next: { revalidate: false, tags }, cache: 'force-cache' })
// draft:     client.withConfig({ token, useCdn: false, perspective: 'drafts', stega }).fetch(..., { cache: 'no-store' })
```

Tag convention (`features/sanity/tags.ts`): `type:<_type>`, `doc:<_id>` (published id, no `drafts.`),
`path:<uri>`; site-wide singletons (`site`) are added to every page fetch so a
publish there busts everything.

`/api/revalidate`: validates `@sanity/webhook` signature (`SANITY_REVALIDATE_SECRET`),
body `{ _type, _id, uri?, slug? }` (GROQ projection configured in the webhook),
calls `revalidateTag` for the derived tags. Astro: `Astro.cache` with
`cache.set({ tags })` on responses, `Vary: Cookie, Authorization, Accept`,
`private, no-store` for draft/basic-auth/markdown responses, and
`cache.invalidate({ tags })` in the endpoint.

Webhook projection (documented and created by the setup script):
`{ _type, _id, "uri": coalesce(uri.current, slug.current) }` on create/update/delete.

## 6. Routing & proxy/middleware order

1. Static/asset/`_next`/`/studio`/`/api/*` pass through (except `/api/agents/markdown` which is only reachable by rewrite).
2. **Basic auth**: read `SITE_SECURITY_QUERY` (short-lived cache, 60s in-memory + tagged). If site-wide enabled, or the matched document has `passwordProtect`, require `Authorization: Basic` against env credentials; else 401 with `WWW-Authenticate`.
3. **Redirects**: `REDIRECTS_QUERY` (cached), match `from` (exact path), respond 301/302 with `to` (internal appLink resolved or external).
4. **Markdown negotiation**: if `Accept` prefers `text/markdown` over `text/html` (first char check short-circuits browsers), rewrite to `/api/agents/markdown?path=<path>`; that handler returns the stored `agents.markdown` when `serveMarkdown` and the doc is published and not password protected, `Content-Type: text/markdown; charset=utf-8`; if no doc, 404 with the Markdown recovery map.
5. **Real 404s**: unknown path (not in the routed inventory) responds with a genuine 404 status before streaming (Next: `notFound()` in the route; proxy consults the inventory cache so agents get 404 + Markdown map instead of a 200 shell).

## 7. Agent layer

- `/llms.txt`: 404 unless `site.agents.serveLlmsTxt`; serves the **published** `llmsTxt` field verbatim, `text/plain`.
- Generate llms.txt (Studio button → `POST /api/agents/llms-txt/generate`): reads `AGENT_INVENTORY_QUERY` (same visibility rules as sitemap, drafts overlaid), builds `{ title, url, excerpt }` entries in code, calls Sanity Agent Actions `client.agent.action.generate` with the guidance field as instruction and the inventory as structured input, writes `site.agents.llmsTxt` on the draft. URLs never pass through the model; the prompt tells the model to use the provided URLs exactly, and the handler validates every URL in the output against the inventory.
- Per-page Markdown (Studio button → `POST /api/agents/markdown/generate` `{ id }`): runs the **deterministic serializer** `features/agents/serialize-markdown.ts` over the document's resolved sections and writes `agents.markdown` on the draft. Serializer walks any object recursively and renders by factory name: `appHeading`, `appRichText`, `appMedia` (as `![alt](url)` or a link for video), `appLink` (absolute URL), `appButton`, plus `title`/`eyebrow`/`description` string conventions and FAQ/logo item arrays. No per-section branching. One labelled extension point for project-specific fields.
- Agent 404: `/api/agents/not-found` returns Markdown listing `/llms.txt`, `/sitemap.xml`, `/openapi.json` and top pages.
- `/openapi.json`: OpenAPI 3.1 built by `features/agents/openapi.ts` from `site.name`; paths `/{path}` (Markdown negotiation), `/llms.txt`, `/openapi.json`, `/sitemap.xml`, `/robots.txt`, `/feed.xml`, `/api/contact`; shared `ErrorResponse { error, code, hint? }`.
- All `/api/*` errors use `{ error: string, code: string, hint?: string }` via `features/utils/api-error.ts`.
- `robots.txt`: allow search/citation bots, disallow training bots (`GPTBot`, `Google-Extended`, `CCBot`…), `Content-Signal: search=yes,ai-train=no,use=reference`, disallow `/api/`, `/studio`, sitemap URL.

## 8. SEO

`features/site/metadata.ts` builds metadata: document `seo` overrides site
defaults field-by-field (empty override falls back). Canonical from
`NEXT_PUBLIC_URL`/`PUBLIC_URL` + path. OG image: document `seo.image` →
`site.seo.image` cropped to 1200×630 via `@sanity/image-url` (`fit('crop')`,
hotspot-aware); `/og?path=` route renders a fallback card with `ImageResponse`
(Next) / `satori`+`@resvg/resvg-js` or a static fallback (Astro). Sitemap from
`SITEMAP_QUERY` (excludes noIndex + password-protected + unpublished). RSS
`feed.xml` from articles. JSON-LD `WebSite` + `Article`.

## 9. Forms & spam prevention

- Zod schema `features/forms/contact-schema.ts` shared by client and server: `name`, `email`, `message`, `_hp` (honeypot, must be empty), `_t` (timing token).
- Timing token: HMAC-SHA256 of the render timestamp with `FORM_SECRET`; server rejects if elapsed < 3 s or > 24 h or signature invalid.
- On success: create `submission` document (edit token, server only), send email via Resend from `RESEND_FROM` to `site.notifications.recipients`, respond `{ ok: true }`. Errors use the shared shape.
- Client: react-hook-form + zodResolver, accessible field errors, `aria-live` status.

## 10. Env

Next: `env.ts` with `@t3-oss/env-nextjs`. Astro: `src/env.ts` with `@t3-oss/env-core` reading `import.meta.env`.

```
NEXT_PUBLIC_URL / PUBLIC_URL
NEXT_PUBLIC_SANITY_PROJECT_ID / PUBLIC_SANITY_PROJECT_ID
NEXT_PUBLIC_SANITY_DATASET / PUBLIC_SANITY_DATASET
NEXT_PUBLIC_SANITY_API_VERSION / PUBLIC_SANITY_API_VERSION   (2025-02-19)
NEXT_PUBLIC_SANITY_STUDIO_BASE_PATH / PUBLIC_SANITY_STUDIO_BASE_PATH (/studio)
SANITY_API_VIEW_TOKEN      viewer token (drafts)
SANITY_API_EDIT_TOKEN      editor token (submissions, agent writes)
SANITY_REVALIDATE_SECRET
SANITY_USE_CDN             optional override
BASIC_AUTH_USER, BASIC_AUTH_PASSWORD
FORM_SECRET
RESEND_API_KEY, RESEND_FROM
NEXT_PUBLIC_UMAMI_WEBSITE_ID / PUBLIC_UMAMI_WEBSITE_ID, ..._UMAMI_SRC
MUX_TOKEN_ID, MUX_TOKEN_SECRET (studio plugin)
```

## 11. Tooling

- Node 24 (`.nvmrc`, `engines`), npm.
- TypeScript strict, `noUncheckedIndexedAccess`.
- Biome 2 for lint + format (`biome.jsonc`), `npm run check`.
- lefthook: pre-commit `biome check --staged`, commit-msg `commitlint` (conventional).
- Plop generators: `npm run plop section <Name>` creates `sanity/schemas/sections/section-<name>.ts`, registers it in `index-registry.ts` and the section set constant, adds the GROQ projection in `queries/fragments/sections.ts`, creates `features/page-builder/sections/<name>.tsx`, registers it in the renderer map, and adds a serializer note. Also `route` and `feature` generators.
- Scripts: `npm run sanity:project-setup` (interactive: creates project + dataset via `@sanity/cli`, mints view/edit tokens, adds CORS origins, registers the revalidate webhook, writes `.env`, imports `seed/`), `npm run sanity:backup` (export dataset to `backups/<date>.tar.gz`), `npm run sanity:copy-dataset --from --to`, `npm run sanity:typegen` (`sanity schema extract` + `sanity typegen generate`).
- `.mcp.json`: `next-devtools` (`npx next-devtools-mcp`) [Next only], `chrome-devtools` (`npx chrome-devtools-mcp`), `sanity` (`npx @sanity/mcp-server`).

## 12. Agent instructions

`AGENTS.md` (CLAUDE.md just says "Read AGENTS.md") covers: the layout, the rules
in §2/§3/§4, how to add a section (use plop), how to add a document type, the
fetch layer rules (always tags, never `revalidate: N`), the proxy order, env
rules, verification commands (`npm run check`, `npm run typecheck`, `npm run build`).

`.claude/skills/<name>/SKILL.md` (a dozen, scoped): `add-section`, `add-document-type`,
`add-route`, `fetch-layer`, `field-factories`, `studio-structure`, `agents-layer`,
`seo-metadata`, `forms-and-spam`, `basic-auth-and-redirects`, `draft-mode-preview`,
`verify-in-browser`.

## 13. Verification bar

Each edition must pass, from a clean clone with `.env.example` copied to `.env`
and placeholder Sanity ids:

```
npm run check       # biome
npm run typecheck   # tsc --noEmit (and astro check)
npm run build
```

Build must not require network access to a real Sanity project (queries run at
request time; pages are dynamic or handle empty results).
