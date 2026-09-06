# /openapi.json

`app/openapi.json/route.ts` serves an OpenAPI 3.1 document built by
`features/agents/openapi.ts` from the site name. It documents:

- `GET /{path}`: any page, with `text/markdown` negotiation
- `GET /llms.txt`, `/sitemap.xml`, `/robots.txt`, `/feed.xml`
- `POST /api/contact` with the `ContactRequest` schema
- the shared `ErrorResponse { error, code, hint? }`

The route is `force-dynamic` so `next build` never queries Sanity. Regenerate
nothing: the document is built per request and cached for an hour by header.
Add a path to the builder when you add a public route.
