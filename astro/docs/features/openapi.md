# openapi.json

Where: `src/pages/openapi.json.ts`, `src/features/agents/openapi.ts`.

An OpenAPI 3.1 document built from `site.name` and `PUBLIC_URL`, describing:
`/{path}` (HTML or Markdown by `Accept`), `/llms.txt` (only when served),
`/openapi.json`, `/sitemap.xml`, `/robots.txt`, `/feed.xml` and
`POST /api/contact` with the `ContactRequest` and shared `ErrorResponse
{ error, code, hint? }` schemas. Every `/api/*` error uses that shape through
`apiError` in `src/features/utils/api-error.ts`. Add a path here whenever a new
public endpoint ships.
