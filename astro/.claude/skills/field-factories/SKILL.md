---
name: field-factories
description: How to use and extend the Sanity field factories (link, media, rich text, seo, page builder, uri, heading, eyebrow, icon, agents, security). Use when adding fields to any schema.
---

# Field factories

Every primitive enters a schema through a factory in `sanity/schemas/fields/`. Factories
return `defineField(...)` and guarantee the object type name the frontend and the Markdown
serializer rely on (spec section 4):

| factory | type | frontend shape |
|---|---|---|
| `createLinkField` | `appLink` | kind, label, internal ref, href, email, phone, file, params, newTab, download |
| `createMediaField` | `appMedia` | kind, width, height, aspectRatio, alt, image, video, lottie, rive |
| `createRichTextField` | `appRichText` | Portable Text with constrained styles and marks |
| `createSeoField` | `appSeo` | title, description, image, noIndex |
| `createPageBuilderField` | `appPageBuilder` | ordered sections, `whitelist` / `blacklist` |
| `createHeadingField` | `appHeading` | text, level |
| `createUriField` / `createSlugField` | slug | full path / namespace slug |
| `createEyebrowField`, `createIconField`, `createAgentsFields`, `createSecurityFields` | see files |

Rules:
- Call a factory per use; never copy a factory's output into a schema.
- New capability goes into the factory so every call site inherits it.
- Relative imports only inside `sanity/`; the folder is byte-identical across editions.
- Descriptions under 60 characters, no em dashes, say what to enter.
- After changing a factory run `npm run sanity:typegen` and fix the frontend types.
