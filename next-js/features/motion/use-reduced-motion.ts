"use client";

import { useMediaQuery } from "@mantine/hooks";

/** Mirrors `prefers-reduced-motion: reduce`. Defaults to true until measured. */
export function useReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)", true, {
    getInitialValueInEffect: true,
  });
}
