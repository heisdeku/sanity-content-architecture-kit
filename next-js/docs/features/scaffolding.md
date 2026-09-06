# Scaffolding with plop

`npm run plop <generator> [name]`. Generators live in `plopfile.mjs`, templates in `templates/`.

## `section`

```
npm run plop section Testimonials
```

Creates and edits:

| Action | File |
|--------|------|
| add | `sanity/schemas/sections/section-testimonials.ts` (eyebrow, heading, description from factories) |
| modify | `sanity/schemas/index-registry.ts`: import + entry after `sectionMedia,` |
| modify | `sanity/config/constants.ts`: `'sectionTestimonials',` after `'sectionMedia',` in `SECTION_TYPES` |
| modify | `sanity/queries/fragments/sections.ts`: projection after the `sectionMedia` entry in `SECTION_PROJECTIONS` |
| add | `features/page-builder/sections/testimonials.tsx` |
| modify | `features/sanity/types.ts`: `TestimonialsSection` after `MediaSection` |
| modify | `features/page-builder/page-builder.tsx`: import at `// plop:page-builder-import`, case at `// plop:page-builder-case` |

Then `npm run sanity:typegen` and `npm run check && npm run typecheck`. The
exhaustive `switch` in the page builder fails to compile until the case exists,
so a forgotten registration is caught by `typecheck`.

### Anchors the generator relies on

The `sanity/` folder is shared with the Astro edition and carries no plop
comments. The generator matches the shapes those files already have:

- `index-registry.ts`: the line `import { sectionRichText } from './sections/section-rich-text'` and the array entry `  sectionMedia,`
- `constants.ts`: the entry `  'sectionMedia',` in `SECTION_TYPES`
- `fragments/sections.ts`: the `sectionMedia: /* groq */ \`{ ... }\`,` entry (last in `SECTION_PROJECTIONS`)

If those files are reordered, update the regexes in `plopfile.mjs`.

`features/` files use explicit anchors (`// plop:page-builder-import`,
`// plop:page-builder-case`, the `MediaSection` type line). Keep them.

## `route`

```
npm run plop route work
```

Creates `app/work/page.tsx` with `generateMetadata`, `sanityFetch`, tags and
`notFound()` wired. Edit the query and tags, then add the route to
`SITEMAP_QUERY`, `AGENT_INVENTORY_QUERY` and `features/agents/openapi.ts`.

## `feature`

```
npm run plop feature newsletter
```

Creates `features/newsletter/newsletter.tsx` and `docs/features/newsletter.md`.
