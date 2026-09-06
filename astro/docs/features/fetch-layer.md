# Fetch layer

Where: `src/features/sanity/{client,fetch,tags,webhook}.ts`, `src/pages/api/revalidate.ts`, `astro.config.mjs`.

## Clients

`sanity:client` (from `@sanity/astro`, configured in `astro.config.mjs`) is the
base. `publicClient` (published, CDN off in production and on in development,
`SANITY_USE_CDN` overrides), `previewClient` (viewer token, `drafts`
perspective, stega on, CDN off) and `writeClient` (editor token, raw perspective).

## sanityFetch

```ts
const { data, error } = await trySanityFetch({
  query: PAGE_BY_URI_QUERY,
  params: { uri },
  tags: [`path:${uri}`],
  draft: Astro.locals.draft,
  cache: Astro.cache,
});
```

- `tags` is required. `type:site` is always added because the header and footer
  render on every page.
- `cache` registers the tags on the response (`Astro.cache.set({ tags })`).
  In draft mode it calls `cache.set(false)` so nothing is stored.
- `sanityFetch` throws `SanityUnavailableError`; `trySanityFetch` returns
  `{ data: null, error }` so routes render `ConnectSanity` (homepage, listings) or a
  real 404 (document routes) instead of a 500, and calls `cache.set(false)` so the
  outage response is never stored.

## Astro caches responses, not fetches

Astro 7 ships a stable route cache: `cache.provider` in `astro.config.mjs`,
`Astro.cache` / `context.cache` in routes and middleware. This edition uses
`cacheVercel()` from `@astrojs/vercel/cache` when `VERCEL` is set (headers
`Vercel-CDN-Cache-Control` and `Vercel-Cache-Tag`, invalidation through
`@vercel/functions` `invalidateByTag`) and `memoryCache()` otherwise
(`astro preview`, other hosts). In `astro dev` the cache object exists but never
stores anything.

Because whole responses are cached, requests that must not receive cached HTML
have to miss on purpose: draft mode (cookie), Basic Auth (Authorization) and
agents (Accept). `Vary: Cookie, Authorization, Accept` gives them their own key
and `private, no-store` keeps them out of the store.

## Tags

`type:<_type>`, `doc:<_id>` (published id), `path:<uri>`, plus `type:site` on
every page and `type:inventory` on sitemap-like responses. Pages with an
article list section also carry `type:article` (`sectionTags`).

## Revalidation

The Sanity webhook posts `{ _type, _id, "uri": coalesce(uri.current, slug.current) }`
to `/api/revalidate`, signed with `SANITY_REVALIDATE_SECRET`. The endpoint
verifies the signature with `@sanity/webhook`, derives tags with
`tagsFromWebhook`, calls `cache.invalidate({ tags })` and clears the
middleware's 60 s caches (security, redirects, Markdown eligibility).

Debug: on Vercel read `x-vercel-cache`; a HIT after a publish means the tag was
never busted, so check the webhook delivery log before touching the client.
