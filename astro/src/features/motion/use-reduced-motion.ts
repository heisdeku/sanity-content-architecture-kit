import { useReducedMotion as useMotionReducedMotion } from 'motion/react';

/** Wraps motion's hook so the kit has one import path for the preference. */
export function useReducedMotion(): boolean {
  return useMotionReducedMotion() ?? false;
}
