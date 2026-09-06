# Redirects

Where: `src/middleware.ts`, `src/features/site/redirects.ts`.

- Editors manage `site.redirects[]` (`from`, `to` as an appLink, `permanent`).
- `REDIRECTS_QUERY` is cached 60 s; `to` is resolved with the single link
  resolver (`resolveLink`), so internal targets follow slug changes.
- Match is exact on the normalized path (no trailing slash). Status is 301 when
  `permanent` is true (default) and 302 otherwise.
- Redirects run after Basic Auth and before Markdown negotiation, so a
  protected site still protects its redirects and agents follow them too.
- Unreachable Sanity means no redirects (logged), never an error.
