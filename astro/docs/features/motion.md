# Motion

Where: `src/features/motion/{reveal,stagger}.tsx`, `use-reduced-motion.ts`, `src/features/lenis/lenis.astro`.

- `Reveal` fades and lifts children once when they enter the viewport;
  `Stagger` + `Stagger.Item` stagger a group. Both are React islands on the
  `motion` package; mount them with `client:visible` from `.astro` files.
- `useReducedMotion` wraps `motion/react`; every component renders plain
  markup when the visitor prefers reduced motion.
- Lenis smooth scroll is a vanilla `<script>` (no hydration cost) that starts on
  `astro:page-load`, stops on `astro:before-swap`, and stays off for reduced
  motion and coarse pointers.
- `globals.css` neutralizes animations under `prefers-reduced-motion` as well.
