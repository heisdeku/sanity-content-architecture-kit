# View transitions

Where: `src/layouts/base-layout.astro` (`<ClientRouter />` from `astro:transitions`), `src/features/view-transition/transition-names.ts`.

`ClientRouter` turns navigation into client-side transitions with the View
Transitions API. `transitionName(scope, key)` builds stable `transition:name`
values so the same element morphs between pages: article titles and covers
between the list and the article, page titles, the site name in the header.
Scripts that must survive swaps listen to `astro:page-load` and
`astro:before-swap` (see Lenis). Umami uses `data-astro-rerun`.
