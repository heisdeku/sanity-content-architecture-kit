# Draft mode and visual editing

Where: `src/features/draft-mode/*`, `src/pages/api/draft-mode/{enable,disable}.ts`, `src/layouts/base-layout.astro`.

- Presentation opens `/api/draft-mode/enable?sanity-preview-secret=...&sanity-preview-pathname=...`.
  The route validates the secret with `@sanity/preview-url-secret`
  (`validatePreviewUrl`, the same mechanism next-sanity uses) using the viewer
  token, sets the draft cookie and redirects to the page.
- The cookie (`kit-draft-mode`) is httpOnly, `SameSite=None; Secure`, and its
  value is an HMAC keyed with `SANITY_API_VIEW_TOKEN`, so it cannot be forged
  and it expires when the token rotates. No extra secret to configure.
- The middleware sets `Astro.locals.draft`. Routes pass it to `sanityFetch`,
  which switches to `previewClient` (drafts perspective, stega on) and opts out
  of the route cache. The layout sets `Cache-Control: private, no-store`.
- `BaseLayout` renders `<VisualEditing enabled={draft} />` from
  `@sanity/astro/visual-editing` and `DraftModeBanner` with an exit link.
- `/api/draft-mode/disable?redirect=/path` clears the cookie.
- `sanity/presentation/resolve.ts` maps routes to documents and exposes
  `previewUrl` with these two endpoints; `PUBLIC_URL` is the preview origin.
