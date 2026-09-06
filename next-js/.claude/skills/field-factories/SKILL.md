---
name: field-factories
description: Use or extend the field factories (createLinkField, createMediaField, createRichTextField, createSeoField, createPageBuilderField, createHeadingField and friends). Use when adding fields to any schema or when a factory needs a new option.
---

# Field factories

Read `docs/features/field-factories.md` and `../docs/architecture.md` §4.

## Rules

- Primitives enter a schema only through a factory in
  `sanity/schemas/fields/`. Never `type: "image"` or `type: "url"` directly in
  a section or document.
- Each factory emits a fixed object type (`appLink`, `appMedia`, `appRichText`,
  `appSeo`, `appHeading`, `appIcon`). The Markdown serializer and the frontend
  key on those names; do not rename them.
- Every option is a restriction of the canonical type (`allowed`, `styles`,
  `whitelist`), never a new shape. The GROQ fragment for the type stays the
  same regardless of options.
- Field descriptions: under 60 characters, no em dashes, say what to enter.

## Adding an option to a factory

1. Add it to the options type and pass it through `options` on the field so
   the input component can read it.
2. Validate it in the factory's `validation` (the Studio must refuse values
   the option forbids).
3. If it changes what the frontend receives, update the fragment in
   `sanity/queries/fragments/` and the structural type in the matching
   `features/` file (`LinkValue`, `MediaValue`, `HeadingValue`, `ImageValue`).
4. `npm run sanity:typegen`.

## Frontend counterparts

| Factory | Component / helper |
|---------|--------------------|
| `createLinkField` | `features/sanity/resolve-link.ts`, `features/site/navigation-link.tsx` |
| `createMediaField` | `features/media/media.tsx` |
| `createRichTextField` | `features/rich-text/rich-text.tsx` |
| `createHeadingField` | `features/page-builder/heading.tsx` |
| `createIconField` | `features/page-builder/icon.tsx` (`ICON_NAMES` map) |
| `createSeoField` | `features/site/metadata.ts` |
