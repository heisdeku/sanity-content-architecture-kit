---
name: draft-mode-preview
description: Draft mode, Presentation tool and visual editing wiring in Astro. Use when preview does not show drafts or overlays are missing.
---

# Draft mode and preview

- Enable: Presentation opens `/api/draft-mode/enable?sanity-preview-secret=...`. The route
  validates the secret with `@sanity/preview-url-secret` (viewer token) and sets the signed
  httpOnly cookie from `src/features/draft-mode/cookie.ts`. Disable: `/api/draft-mode/disable`.
- The middleware sets `Astro.locals.draft`; routes pass `draft` to `sanityFetch`, which
  switches to `previewClient` (drafts perspective, stega on) and disables the route cache.
- `BaseLayout` renders `<VisualEditing enabled={draft} />` from `@sanity/astro/visual-editing`
  and the draft banner.
- Presentation config lives in `sanity/presentation/resolve.ts`; the preview origin is
  `PUBLIC_URL`.
- Requirements: `SANITY_API_VIEW_TOKEN` set, CORS origin added for the app URL, pages rendered
  on demand (`output: 'server'`).
