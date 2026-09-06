/** Breakpoints in px. Must match --breakpoint-* in src/styles/globals.css. */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;
