---
name: add-section
description: Add a new page-builder section type (Sanity schema + GROQ projection + Astro renderer) with the plop generator. Use when asked to add, create or scaffold a section.
---

# Add a section

Sections are a closed set. Adding one is a deliberate change in five places, and
the generator makes all five edits so nothing drifts.

1. Run `npm run plop section <Name>` from `astro/` (Name in PascalCase, e.g. `Testimonials`).
   It creates and edits:
   - `sanity/schemas/sections/section-<name>.ts` (schema built from field factories)
   - `sanity/schemas/index-registry.ts` (adds the type to `schemaTypes`)
   - `sanity/config/constants.ts` (adds `'section<Name>'` to `SECTION_TYPES`)
   - `sanity/queries/fragments/sections.ts` (adds the GROQ projection to `PAGE_BUILDER_FRAGMENT`)
   - `src/features/page-builder/sections/<name>.astro` (renderer)
   - `src/features/page-builder/page-builder.astro` (adds the `_type` case)
2. Fill the schema with factories only: `createHeadingField`, `createRichTextField`,
   `createMediaField`, `createLinkField`, `createEyebrowField`. Never inline a raw image or
   link object. Descriptions under 60 characters, no em dashes.
3. Extend the GROQ projection with the fragments (`MEDIA_FRAGMENT`, `LINK_FRAGMENT`,
   `RICH_TEXT_FRAGMENT`) for every factory field you added.
4. Run `npm run sanity:typegen` so `sanity/sanity.types.ts` has the new section type, then
   type the renderer's props from `PageBuilderSection` in `src/features/page-builder/types.ts`.
5. The Markdown serializer needs no change when you only use factories. Project-specific
   objects go in the labelled extension point in `src/features/agents/serialize-markdown.ts`.
6. Verify: `npm run check && npm run typecheck && npm run build`, then open `/studio` and add
   the section to a page.
