---
name: fetch-layer
description: Fetch content from Sanity in a route or feature with the correct caching, tags and draft-mode behaviour. Use whenever calling sanityFetch, adding a query, or debugging stale content.
---

# Fetch layer

Read `docs/features/fetch-layer.md` first.

## Steps

1. Define the query in `sanity/queries/documents/<type>.ts` with
   `defineQuery` from `groq`. Reuse fragments from `sanity/queries/fragments/`.
2. Run `npm run sanity:typegen` so the result type exists in
   `sanity/sanity.types.ts`.
3. Call it:

```ts
import { sanityFetch } from "@/features/sanity/fetch";
import { docTags } from "@/features/sanity/tags";

const page = await sanityFetch({ query: PAGE_BY_URI_QUERY, params: { uri }, tags: docTags({ type: "page", path: uri }) });
```

4. Tags are required. Use `type:` for lists, `doc:` + `path:` for single
   documents. `type:site` is added for you.
5. Never pass `revalidate: N`. Never call Sanity from `sitemap.ts` or other
   metadata routes without `export const dynamic = "force-dynamic"`.
6. Handle the empty case: render an empty state or `notFound()`, never throw.

## Stale content checklist

- Terminal shows `HIT` for a fetch that should be fresh: the tag was not
  busted. Check the webhook delivery log in Sanity manage and the tags the
  route used.
- `MISS` but old data: CDN. `useCdn` must be false in production.
- Draft mode showing published data: the preview client is not being used;
  check `draftMode().isEnabled` in `features/sanity/fetch.ts`.
