---
name: add-section
description: Add a new page-builder section end to end (schema, registry, GROQ projection, React component, renderer case). Use when an editor needs a new block type.
---

# Add a section

Read `docs/features/scaffolding.md` and `docs/features/field-factories.md`.

## Steps

1. `npm run plop section <Name>`. It creates the schema, registers it in
   `sanity/schemas/index-registry.ts` and `SECTION_TYPES`, adds the projection
   in `sanity/queries/fragments/sections.ts`, creates
   `features/page-builder/sections/<name>.tsx` and adds the renderer case.
2. Edit the schema in `sanity/schemas/sections/section-<name>.ts`. Only use
   factories for primitives: `createHeadingField`, `createRichTextField`,
   `createMediaField`, `createLinkField`, `createEyebrowField`, `createIconField`.
   Field descriptions under 60 characters, no em dashes.
3. Edit the projection so every primitive uses its fragment
   (`HEADING_FRAGMENT`, `RICH_TEXT_FRAGMENT`, `MEDIA_FRAGMENT`, `LINK_FRAGMENT`,
   `BUTTON_FRAGMENT`).
4. `npm run sanity:typegen`.
5. Build the component. Reserve media boxes with `<Media>`; render headings
   with `<Heading>`; wrap in `<Section type={section._type}>`.
6. Scope it: if the section is promotional, add it to the `blacklist` of
   `legalPage`; if editorial only, to the `whitelist` of `article`.
7. `npm run check && npm run typecheck && npm run build`.

## Serializer

Nothing to do if the section uses factories. Only a project-specific object
type needs an entry in `PROJECT_SERIALIZERS`
(`features/agents/serialize-markdown.ts`).
