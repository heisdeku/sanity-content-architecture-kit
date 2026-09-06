# Fetch layer

The part that must not drift. Two caches sit between a published document
and the page: the Sanity CDN and the Next.js Data Cache. This layer decides
who does what.

## Clients (`features/sanity/client.ts`)

- `client`: public reads. `useCdn` is false in production and true in
  development; `SANITY_USE_CDN` overrides both.
- `previewClient`: `client` with the viewer token, `useCdn: false`,
  `perspective: "drafts"` and stega enabled with the Studio URL. Used only in
  draft mode.
- `writeClient`: the edit token, server-only. Used by the contact sink and the
  agent generators.
- `agentClient`: `writeClient` on a recent API version for Agent Actions.

## `sanityFetch` (`features/sanity/fetch.ts`)

```ts
const data = await sanityFetch({ query: PAGE_BY_URI_QUERY, params: { uri }, tags: pageTags(uri) });
```

- `tags` is required. Forgetting a tag means a page that never updates.
- Published: `client.fetch(query, params, { cache: "force-cache", next: { revalidate: false, tags } })`.
- Draft (`draftMode().isEnabled`): `previewClient.fetch(query, params, { cache: "no-store" })`.
- Every fetching route exports `dynamic = "force-dynamic"`. In Next 16,
  `draftMode()` alone does not opt out of prerendering, and the build must
  never call Sanity. Pages render at request time; the Data Cache caches per fetch.

## Tags (`features/sanity/tags.ts`)

- `type:<_type>` for a list or a query over a type
- `doc:<_id>` with the published id (no `drafts.` prefix)
- `path:<uri>` for a routed page
- `type:site` is appended to every fetch, so publishing the Site document
  (navigation, SEO defaults, redirects) busts everything.

## Revalidation (`app/api/revalidate/route.ts`)

The GROQ webhook posts `{ _type, _id, uri }` signed with
`SANITY_REVALIDATE_SECRET`. The handler validates the signature with
`parseBody` from `next-sanity/webhook` (built on `@sanity/webhook`), derives
the tags with `tagsForDocument`, and calls `revalidateTag(tag, "max")` for
each. `"max"` serves stale content while the refetch runs.

Webhook projection (the setup script creates it):

```
{ _type, _id, "uri": coalesce(uri.current, slug.current) }
```

Trigger on create, update and delete. Filter: `_type in ["homepage", "page", "article", "category", "legalPage", "site"]`.

## Debugging staleness

`next.config.ts` sets `logging.fetches.fullUrl` in development. A `HIT` where
you expected fresh data means a tag was never busted (check the webhook). A
`MISS` that still returns old data means the CDN served it (check `useCdn`).

## Why not `defineLive`

`<SanityLive>` on Next 16 multiplies requests through link prefetch. Until
that settles, this hand-built tag layer is the predictable cost.
