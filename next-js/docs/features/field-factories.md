# Field factories

Every primitive enters a schema through a factory in `sanity/schemas/fields/`.
A factory returns a `defineField(...)` configured per call; the logic lives in
one place and every call site inherits changes. Never write
`{ type: 'appLink' }` by hand.

| factory | type name | options |
|---------|-----------|---------|
| `createLinkField` | `appLink` | `name, title, group, required, noCustomText, allowed: LinkKind[]` |
| `createMediaField` | `appMedia` | `name, title, group, required, allowed: MediaKind[], withCustomRatio` |
| `createRichTextField` | `appRichText` (or inline array with identical members) | `name, title, group, required, styles, marks, lists, allowImages, allowMedia` |
| `createSeoField` | `appSeo` | `group, variant: 'document' \| 'site'` |
| `createPageBuilderField` | array named `pageBuilder` | `group, whitelist, blacklist, required` |
| `createUriField` | slug named `uri` | `group, required, source` |
| `createSlugField` | slug named `slug` | `group, required, source, namespace` |
| `createHeadingField` | `appHeading` | `name, title, group, required, level, max` |
| `createEyebrowField` | string | `name, title, group, max` (default 60) |
| `createIconField` | `appIcon` | `name, title, group, required` |
| `createAgentsFields` | object `agents` (returns an array, spread it) | `group, variant` |
| `createSecurityFields` | object `security` (returns an array, spread it) | `group, variant` |

```ts
fields: [
  createHeadingField({ required: true, level: 'h1', max: 90 }),
  createRichTextField({ name: 'description', styles: ['normal'], lists: false, allowMedia: false }),
  createMediaField({ allowed: ['image', 'video'], withCustomRatio: true }),
  createLinkField({ name: 'link', noCustomText: true, allowed: ['internal', 'external'] }),
  ...createAgentsFields({ group: 'agents' }),
]
```

## How per-call options work on a shared type

`appLink` and `appMedia` are single named object types (so `_type` is stable
for the frontend and the Markdown serializer). The factory stores its options
on the field (`options.allowed`, `options.noCustomText`, `options.withCustomRatio`)
and adds a field-level validation for `allowed`. The object's input component
(`sanity/components/link-input.tsx`, `media-input.tsx`) reads those options and
hides the members that do not apply. Sub-fields are additionally hidden by
`kind` through `hidden` callbacks, and the object validates that the selected
kind has its payload.

Rich text is different: styles and members must change the schema itself, so
`createRichTextField` inlines the array members (built by
`buildRichTextMembers`) when a call restricts them, and uses the named
`appRichText` type when the options equal the canonical set. Both produce the
same Portable Text shape.

## Frontend contracts (what the fragments project)

- `appLink`: `{ kind, label?, newTab?, download?, href?, email?, phone?, params?, file?: { url }, internal?: { _type, title, uri?, slug? } }`. `href` for internal links is resolved on the frontend from `internal._type` and `ROUTE_NAMESPACES`.
- `appMedia`: `{ kind, width, height, aspectRatio, alt?, customRatio?, image?, video? ({ playbackId, poster, ... }), lottie? ({ url, ... }), rive? ({ url, stateMachine, ... }) }`. Dimensions are always present: image from asset metadata, video from the Mux track, lottie/rive from stored numbers (the Generate button in `generate-media-dimensions-input.tsx` reads them from the file).
- `appRichText`: Portable Text with `markDefs` links expanded to `appLink` and inline `appMedia`/`appImage` resolved.
- `appSeo`: `{ title?, description?, noIndex?, image? }`; empty values fall back to `site.seo` in code.
- `appHeading`: `{ text, level }`. `appButton`: `{ label, variant, icon?, link }`. `appIcon`: projected as its `name`.

## Descriptions

Under 60 characters, no em dashes, say what to enter.
