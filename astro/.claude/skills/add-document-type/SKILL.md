---
name: add-document-type
description: Add a new Sanity document type (schema, structure entry, queries, optional route) following the kit's contracts. Use when asked for a new content type or collection.
---

# Add a document type

1. Decide the role (spec section 3.1): routed page-like document, taxonomy, record, or
   singleton. Routed documents must carry `createAgentsFields()` and `createSecurityFields()`
   and either `createUriField()` (full path) or `createSlugField()` (namespace + slug).
2. Create `sanity/schemas/documents/<name>.ts` with `defineType`, groups for tabs
   (Page / Content / SEO / Agents / Security), factories for every primitive.
3. Register it in `sanity/schemas/index-registry.ts` and add its name to `DOCUMENT_TYPES` in
   `sanity/config/constants.ts`. Routed types also go in `ROUTED_DOCUMENT_TYPES` and
   `ROUTE_NAMESPACES`.
4. Add it to the desk in `sanity/structure/structure.ts` (top level order is fixed; nest
   under an existing item when it is taxonomy).
5. Write queries in `sanity/queries/documents/<name>.ts` with `defineQuery` and the shared
   fragments. Add it to `SITEMAP_QUERY` and `AGENT_INVENTORY_QUERY` if it is routed.
6. If it is routed, add a route with `npm run plop route` and follow `add-route`.
7. Run `npm run sanity:typegen`, then `npm run check && npm run typecheck && npm run build`.
