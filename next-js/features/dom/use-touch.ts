"use client";

import { useMediaQuery } from "@mantine/hooks";

/** True on coarse pointer devices (touch screens). */
export function useTouch() {
  return useMediaQuery("(pointer: coarse)", false, {
    getInitialValueInEffect: true,
  });
}
