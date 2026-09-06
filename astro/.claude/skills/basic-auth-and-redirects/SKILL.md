---
name: basic-auth-and-redirects
description: Site-wide and per-document Basic Auth plus CMS-managed redirects in the Astro middleware. Use when changing access protection or redirects.
---

# Basic Auth and redirects

Both live in `src/middleware.ts` and `src/features/site/{basic-auth,security,redirects}.ts`.

- Order (spec section 6): pass-through for assets, `/studio`, `/api/*` (except the
  rewrite-only Markdown route) -> Basic Auth -> redirects -> Markdown negotiation -> 404s.
- `SITE_SECURITY_QUERY` returns `basicAuthEnabled` and the paths with `passwordProtect`;
  it is cached 60 s in memory. Site-wide wins. Credentials are `BASIC_AUTH_USER` and
  `BASIC_AUTH_PASSWORD` (env only), compared with `timingSafeEqual`.
- If Sanity is unreachable the middleware fails open and logs a warning. If protection is
  on but credentials are missing it also fails open with a warning.
- Protected responses are `private, no-store` and never enter the route cache.
- Redirects come from `site.redirects[]` (`REDIRECTS_QUERY`, cached 60 s): exact `from`
  match, `to` is an appLink resolved with `resolveLink`, status 301 or 302 from the document.
- `/api/revalidate` clears both TTL caches when the Site document changes.
