"use client";

import { useMediaQuery } from "@mantine/hooks";
import { BREAKPOINTS, type Breakpoint } from "@/features/dom/constants";

/** True when the viewport is at least the given Tailwind breakpoint. */
export function useBreakpoint(breakpoint: Breakpoint, initialValue = false) {
  return useMediaQuery(
    `(min-width: ${BREAKPOINTS[breakpoint]}px)`,
    initialValue,
    {
      getInitialValueInEffect: true,
    },
  );
}
