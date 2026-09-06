# View transitions

Next 16's App Router ships a React canary that exports `<ViewTransition>`,
so there is no config flag: route navigations already run inside a React
transition and any `<ViewTransition>` boundary in the tree animates.

- `features/view-transition/view-transition.tsx` wraps React's component.
  Pass `name` on two routes to morph a shared element (thumbnail to hero).
- `features/view-transition/transition-link.tsx` is `next/link` with a
  stable hook for project-wide link behaviour.
- `react-canary.d.ts` references `react/canary` so the component is typed.
- `app/globals.css` sets a 180ms crossfade on the root and disables the
  pseudo-element animations under reduced motion.

Read `node_modules/next/dist/docs/01-app/02-guides/view-transitions.md` for
the directional and Suspense patterns before adding more.
