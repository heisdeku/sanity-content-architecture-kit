---
name: draft-mode-preview
description: Fix or extend draft mode, the Presentation tool, Visual Editing overlays or stega. Use when editors cannot preview drafts or click-to-edit is broken.
---

# Draft mode and preview

Read `docs/features/draft-mode.md`.

## Where things live

- `app/api/draft-mode/enable/route.ts`: `defineEnableDraftMode` (next-sanity).
- `app/api/draft-mode/disable/route.ts`: disables and redirects back.
- `features/sanity/fetch.ts`: switches to `previewClient` when
  `draftMode().isEnabled`.
- `features/draft-mode/draft-mode-banner.tsx`: the banner with the disable link.
- `app/layout.tsx`: renders `<VisualEditing />` and the banner in draft mode.
- `sanity/presentation/resolve.ts`: locations and main documents.
- `sanity.config.ts`: `presentationTool({ previewUrl: { previewMode: { enable: "/api/draft-mode/enable" } } })`.

## Checklist

- `SANITY_API_VIEW_TOKEN` is set and has Viewer rights.
- The app origin is in the project's CORS origins with credentials allowed.
- The preview client has `stega: { enabled: true, studioUrl }`.
- Strings compared in code are wrapped in `stegaClean`.
- The preview fetch uses `cache: "no-store"`.
