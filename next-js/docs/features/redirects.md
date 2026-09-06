# Redirects

Editors manage redirects in the Site document (Redirects tab). Each rule is
`{ from, to, permanent }` where `from` is an exact path and `to` is an
`appLink` (internal document or external URL).

## Resolution

- `REDIRECTS_QUERY` (`sanity/queries/documents/site.ts`) projects every rule
  with the internal target resolved to a path.
- `features/site/proxy-lookups.ts#getRedirects` fetches it with a plain
  `@sanity/client` (`useCdn: false`) and caches the list in memory for 60
  seconds per instance.
- `proxy.ts` step 3 matches `from` against the normalised request path and
  responds `308` (permanent) or `307` (temporary). External `to` values are
  used verbatim; internal ones become absolute on the request origin.

## Notes

- Redirects run after basic auth, so a protected site does not leak paths.
- A publish on the Site document is picked up within 60 seconds. There is no
  webhook for the proxy cache on purpose: it has no shared cache to bust.
- Query strings are not matched. Add `?` handling in the proxy if a project
  needs it.
