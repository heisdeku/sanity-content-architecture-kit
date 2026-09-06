---
name: basic-auth-and-redirects
description: Change how the proxy protects routes with basic auth or how CMS-managed redirects resolve. Use when touching proxy.ts, security fields, or the redirects tab.
---

# Basic auth and redirects

Read `docs/features/basic-auth.md` and `docs/features/redirects.md`.

## Where things live

- `proxy.ts`: the order is fixed (pass-through, basic auth, redirects,
  markdown negotiation, real 404s). Do not reorder.
- `features/site/basic-auth.ts`: header parsing and constant-time compare.
- `features/site/proxy-lookups.ts`: `getSecurity`, `getRedirects`,
  `getInventoryPaths`. Each is a direct GROQ fetch with `useCdn: false`
  cached in memory for 60 seconds. A `null` return means "unknown": the
  proxy fails open and warns.
- Queries: `sanity/queries/documents/site.ts` (`SITE_SECURITY_QUERY`,
  `REDIRECTS_QUERY`) and `sanity/queries/documents/agents.ts`
  (`AGENT_INVENTORY_QUERY`).

## Rules

- Credentials come from env (`BASIC_AUTH_USER`, `BASIC_AUTH_PASSWORD`). Never
  add a password field to the CMS.
- Site-wide `basicAuthEnabled` beats per-document `passwordProtect`.
- Redirect `from` is an exact path. `to` is an `appLink`; resolve it with
  `features/sanity/resolve-link.ts` on the server, never in the proxy.
- The proxy only uses `fetch` and Web APIs. No `node:` imports.

## Verify

```
BASIC_AUTH_USER=a BASIC_AUTH_PASSWORD=b npm run dev
curl -i localhost:3000/            # 401 when the Site toggle is on
curl -i -u a:b localhost:3000/     # 200
curl -i localhost:3000/old-path    # 308 to the redirect target
```
