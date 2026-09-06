---
name: studio-structure
description: Rules for the Sanity Studio desk structure, singletons, previews and the embedded /studio route in Astro. Use when changing what editors see in the Studio sidebar.
---

# Studio structure

- `sanity/structure/structure.ts` defines the desk. Top level, in this order, nothing else:
  Homepage, Pages, Articles (+ Categories nested), Legal, Submissions (read-only, newest
  first), Site, divider, Media library, Videos.
- Singletons (`homepage`, `site`) are locked by `sanity/structure/singleton-plugin.ts`: no
  create, delete or duplicate. Fixed ids from `SINGLETON_IDS`.
- Preview panes come from `sanity/structure/default-document-node.ts`.
- Tools: Structure, Presentation, Vision (dev only). Presentation resolves locations through
  `sanity/presentation/resolve.ts`.
- In Astro the Studio is mounted by `@sanity/astro` at `PUBLIC_SANITY_STUDIO_BASE_PATH`
  (`/studio`) from the root `sanity.config.ts`. The integration owns the base path; never set
  `basePath` in `sanity.config.ts`.
- Studio buttons that call the app (Generate llms.txt, Generate Markdown) hit
  `/api/agents/*/generate` on the same origin; the endpoints require same-origin requests.
