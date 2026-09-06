import { useMediaQuery } from '@mantine/hooks';
import { BREAKPOINTS, type Breakpoint } from './constants';

/** True when the viewport is at least the given breakpoint (mobile first). */
export function useBreakpoint(breakpoint: Breakpoint, initialValue = false): boolean {
  return useMediaQuery(`(min-width: ${BREAKPOINTS[breakpoint]}px)`, initialValue) ?? initialValue;
}
