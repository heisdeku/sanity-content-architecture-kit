# Draft mode and Presentation

Editors see unpublished content in context; visitors never do.

## Routes

- `app/api/draft-mode/enable/route.ts`: `defineEnableDraftMode` from
  `next-sanity/draft-mode` with the viewer-token client. The Studio's
  Presentation tool opens this URL with a signed secret.
- `app/api/draft-mode/disable/route.ts`: `draftMode().disable()`, then
  redirects to the referring page or `/`.

## What changes when draft mode is on

- `sanityFetch` switches to `previewClient` (`perspective: "drafts"`,
  stega, `cache: "no-store"`).
- `app/(site)/layout.tsx` renders `<VisualEditing />` from `next-sanity/visual-editing`
  and `DraftModeBanner` (`features/draft-mode/draft-mode-banner.tsx`) with a
  link to the disable route.
- Stega encodes source paths into strings, so click-to-edit works in
  Presentation. Use `stegaClean` from `next-sanity` before comparing strings
  or passing them to non-React code.

## Studio side

`sanity/presentation/resolve.ts` maps documents to URLs and URLs to documents
for the Presentation tool. `sanity.config.ts` points `previewUrl` at the app
origin with the enable route.

## Local testing

Browsers must allow third-party cookies for the Presentation iframe on
`localhost`. Chrome works out of the box; Safari needs "Prevent cross-site
tracking" off for local testing.
