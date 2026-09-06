# Scaffolding (plop)

`plopfile.mjs` with templates in `templates/`. Run `npm run plop <generator>`.

## section

`npm run plop section Testimonials` creates and edits:

| file | action | anchor |
|---|---|---|
| `sanity/schemas/sections/section-testimonials.ts` | add | template `templates/section/schema.ts.hbs` |
| `sanity/schemas/index-registry.ts` | modify | after the `sectionRichText` import and after `sectionRichText,` in `schemaTypes` |
| `sanity/config/constants.ts` | modify | before `] as const` of `SECTION_TYPES` |
| `sanity/queries/fragments/sections.ts` | modify | before the closing `}` of `SECTION_PROJECTIONS` |
| `src/features/page-builder/sections/testimonials.astro` | add | template `templates/section/section.astro.hbs` |
| `src/features/page-builder/page-builder.astro` | modify | after the `RichText` import and at `// plop:section-renderer` |

The GROQ projection starts as heading + body; extend it with the fragments for
every factory field you add. Then `npm run sanity:typegen`. The Markdown
serializer needs no change for factory fields.

## route

`npm run plop route` asks for `page` or `endpoint` and a path, and adds
`src/pages/<path>.astro` (layout, metadata, page context) or
`src/pages/<path>.ts` (`apiJson`, cache tags).

## feature

`npm run plop feature <name>` adds `src/features/<name>/<name>.ts`,
`<name>.astro` and `docs/features/<name>.md`.

## When a modify pattern stops matching

Plop's `modify` actions are regexes tied to the current shape of the files in
the table. If a pattern fails, plop reports the file; update the regex in
`plopfile.mjs` in the same change that reshaped the file.
