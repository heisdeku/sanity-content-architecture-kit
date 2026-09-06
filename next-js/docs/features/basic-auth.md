# Basic auth

Gate the whole site, or single documents, behind HTTP basic auth. Built for
staging and pre-launch reviews.

## How it works

- Credentials live in env only: `BASIC_AUTH_USER`, `BASIC_AUTH_PASSWORD`.
  They are never stored in the CMS.
- The toggle lives in the CMS: `site.security.basicAuthEnabled` protects
  everything; `page`, `article` and `legalPage` carry
  `security.passwordProtect` for single routes. Site-wide wins.
- `proxy.ts` step 2 reads the security state through
  `features/site/proxy-lookups.ts` (a direct GROQ fetch with `useCdn: false`
  and a 60 second in-memory cache), then compares the `Authorization: Basic`
  header with `features/site/basic-auth.ts` using a constant-time compare.
- A miss responds `401` with `WWW-Authenticate: Basic realm="Protected"` and
  `Cache-Control: private, no-store`.

## Fail open, on purpose

If credentials are set but the security state cannot be read (no project,
network error, wrong dataset), the proxy logs one warning and lets traffic
through. Locking a site because the CMS is unreachable is worse than leaving
staging open for a minute. Watch for `[proxy] Basic auth credentials are set
but the site security state could not be read` in the logs.

## Files

- `proxy.ts`
- `features/site/basic-auth.ts`
- `features/site/proxy-lookups.ts`
- `sanity/schemas/fields/create-security-fields.ts`
