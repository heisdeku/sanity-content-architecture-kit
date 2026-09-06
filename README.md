# Content Architecture Kit

An open reconstruction of an agent-ready Sanity starter, in two editions that
share one architecture:

| Edition   | Stack | Folder |
|-----------|-------|--------|
| Next.js   | Next.js 16 (App Router, React Compiler), Sanity v6, Tailwind 4, Biome | [`next-js/`](next-js/) |
| Astro     | Astro 7 (server output, Vercel adapter), Sanity v6, Tailwind 4, Biome | [`astro/`](astro/) |

Both editions ship the same decisions. The `sanity/` folder is byte-identical
between them, so schema work done in one edition drops into the other.

## What is inside

- **Schema as a system**: document roles (homepage singleton, pages that own
  their route, articles under a namespace, legal pages, read-only submissions,
  one Site singleton), field factories with guaranteed type names
  (`appLink`, `appMedia`, `appRichText`, `appSeo`), and a page builder with a
  closed section set plus per-document whitelist and blacklist.
- **Fetch layer, solved**: CDN bypassed in production, framework cache doing
  the work, tag-based invalidation from a GROQ webhook, draft mode and
  Presentation wired in.
- **Agent-ready in production**: an editor-owned `/llms.txt` drafted with
  Sanity Agent Actions, a token-light Markdown twin of every page served on the
  same URL via `Accept: text/markdown`, real 404s with a Markdown recovery map,
  and a published `/openapi.json`.
- **Production plumbing**: basic auth for staging (site-wide or per page),
  CMS-managed redirects, per-page SEO with inherited defaults, auto-cropped
  OpenGraph images, sitemap, robots.txt with an AI-training policy, RSS,
  Umami analytics, view transitions, Mux video, Rive and Lottie.
- **Forms**: contact form (react-hook-form + zod) with honeypot and timing
  token, submissions stored in Sanity and forwarded with Resend.
- **Agent-native repo**: `AGENTS.md`, a dozen scoped skills in `.claude/skills`,
  and preconfigured MCP servers (`next-devtools`, `chrome-devtools`, `sanity`).
- **Tooling**: Node 24 pinned, TypeScript strict, Biome, lefthook, commitlint,
  Plop generators for sections, routes and features, an interactive Sanity
  project setup script, backup and dataset-copy scripts, and a seed dataset.

The full design is written down in [`docs/architecture.md`](docs/architecture.md).
Each edition has its own `README.md` and `GETTING-STARTED.md`.

## Quick start

```bash
cd next-js   # or: cd astro
nvm use
npm install
cp .env.example .env
npm run sanity:project-setup   # creates the project, tokens, CORS, webhook, .env, seed
npm run dev
```

## Attribution

This kit is an independent reconstruction built from the publicly documented
architecture of [The Content Architecture](https://www.contentarchitecture.dev/)
by Edoardo Lunardi (the four-part article series and the two engineering
posts). It shares the decisions, not the code. If you want the original,
maintained kit with support and lifetime updates, buy it there.

License: MIT.
