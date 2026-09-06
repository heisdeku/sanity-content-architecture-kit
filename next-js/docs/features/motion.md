# Motion

Small, opt-in animation primitives built on the `motion` package. Everything
respects `prefers-reduced-motion`.

- `features/motion/reveal.tsx`: `<Reveal>` fades and lifts children into
  view once. Under reduced motion it renders a plain element.
- `features/motion/stagger.tsx`: `<Stagger>` with `<Stagger.Item>` reveals
  children in sequence.
- `features/motion/use-reduced-motion.ts`: the media query hook the above
  share. Defaults to reduced until measured so SSR never flashes motion.
- `features/lenis.tsx`: smooth scroll provider (`lenis/react`). Disabled
  under reduced motion. Remove the `<Lenis>` wrapper in `app/layout.tsx` if
  the project does not want smooth scroll.
- `features/dom/use-content-ready.ts`: resolves when fonts are loaded and
  visible images have decoded. Gate intro sequences on it.

Keep motion in the sections that need it. The page builder itself adds none.
