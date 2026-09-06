# Basic Auth

Where: `src/middleware.ts`, `src/features/site/basic-auth.ts`, `src/features/site/security.ts`.

- The Site document's `security.basicAuthEnabled` gates the whole site. Pages,
  articles and legal pages carry `security.passwordProtect` for one route.
  Site-wide wins.
- `SITE_SECURITY_QUERY` returns `{ basicAuthEnabled, protectedPaths[] }` and is
  cached 60 s in memory (`createTtlCache`). `/api/revalidate` clears it.
- Credentials come from `BASIC_AUTH_USER` and `BASIC_AUTH_PASSWORD`, compared
  with `timingSafeEqual` on both halves so timing does not leak which one was wrong.
- Unauthenticated requests get `401` with `WWW-Authenticate: Basic realm="Protected"`
  and `Cache-Control: private, no-store`.
- Fail open: when Sanity is unreachable, or protection is on but credentials are
  missing, the middleware logs a warning and lets the request through rather than
  locking the site out.
- Protected responses set `Astro.locals.protectedByBasicAuth`, which the layout
  turns into `private, no-store` and `Astro.cache.set(false)`; every HTML
  response also sends `Vary: Cookie, Authorization, Accept`.
- Protected pages are never served as Markdown to agents.

Test: enable the toggle in the Studio, set the env vars, then
`curl -i localhost:4321/` (401) and `curl -i -u user:pass localhost:4321/` (200).
