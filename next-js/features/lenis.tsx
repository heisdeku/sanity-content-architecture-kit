"use client";

import { ReactLenis } from "lenis/react";
import type { ReactNode } from "react";
import { useReducedMotion } from "@/features/motion/use-reduced-motion";

/** Smooth scrolling provider. Disabled entirely under reduced motion. */
export function Lenis({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  if (reduced) return <>{children}</>;
  return (
    <ReactLenis root options={{ lerp: 0.12, smoothWheel: true, autoRaf: true }}>
      {children}
    </ReactLenis>
  );
}
