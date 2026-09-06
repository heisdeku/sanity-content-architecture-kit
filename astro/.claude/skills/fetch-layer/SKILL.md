---
name: fetch-layer
description: Rules for fetching Sanity content in the Astro edition (tags, perspectives, useCdn, route cache, revalidation). Use when touching queries, caching, draft mode or the revalidate webhook.
---

# Fetch layer

Files: `src/features/sanity/{client,fetch,tags,webhook}.ts`, `src/pages/api/revalidate.ts`.

Rules that must not drift (spec section 5):

- `sanityFetch({ query, params, tags, draft, cache })`. `tags` is required. Pass
  `cache: Astro.cache` from routes so the tags land on the response.
- Published: `publicClient` (perspective published, `useCdn` false in production, true in
  development, `SANITY_USE_CDN` overrides). Draft: `previewClient` (viewer token, drafts
  perspective, stega on) and `cache.set(false)` so nothing is stored.
- Tags: `type:<_type>`, `doc:<_id>` (published id), `path:<uri>`; `type:site` on every page.
  Helpers in `tags.ts`.
- Astro caches responses, not fetches: the whole route is a hit or a miss. Never set
  `maxAge` on a content page without tags; never use time-based revalidation as the only
  freshness mechanism.
- `/api/revalidate` validates the `@sanity/webhook` signature with `SANITY_REVALIDATE_SECRET`,
  derives tags with `tagsFromWebhook` and calls `cache.invalidate({ tags })`. It also clears
  the middleware TTL caches.
- Draft, Basic Auth and Markdown responses are `private, no-store`; every HTML response
  sends `Vary: Cookie, Authorization, Accept`.

Debug: production responses carry `x-vercel-cache`; a HIT after a publish means the tag was
never busted, so check the webhook, not the client.
