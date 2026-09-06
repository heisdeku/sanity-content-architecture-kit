---
name: studio-structure
description: Change the Studio sidebar, singleton locking, preview panes or Presentation locations. Use when editors need a different navigation or a new document list.
---

# Studio structure

Read `docs/features/studio-structure.md` and `../docs/architecture.md` §3.2.

## The fixed order

1. Homepage (singleton)
2. Pages
3. Articles (with Categories nested)
4. Legal
5. Submissions (read-only, newest first)
6. Site (singleton)
7. divider
8. Media library, Videos

Anything new goes in one of these groups or, with a good reason, as a new
list between 4 and 5. Never add a generic "all documents" list.

## Files

- `sanity/structure/structure.ts`: the sidebar.
- `sanity/structure/singleton-plugin.ts`: blocks create, delete and duplicate
  for `SINGLETON_TYPES`; keep new singletons in `SINGLETON_IDS` and
  `NON_CREATABLE_TYPES` (`sanity/config/constants.ts`).
- `sanity/structure/default-document-node.ts`: preview panes per type.
- `sanity/presentation/resolve.ts`: URL to document mapping for Presentation.
- `sanity.config.ts`: tools (Structure, Presentation, Vision in development).

## Verify

Open `/studio`, check the sidebar order, try to create a Homepage from the
"new document" menu (must be absent), and open a page in Presentation.
