import { BREAKPOINTS, type Breakpoint } from './constants';

export type ResponsiveValue<T> = T | Partial<Record<'base' | Breakpoint, T>>;

/**
 * Resolve a responsive value for a viewport width. `{ base: 1, md: 2 }` at
 * 900px gives 2. Plain values pass through.
 */
export function parseResponsiveValue<T>(value: ResponsiveValue<T>, width: number): T | undefined {
  if (value === null || typeof value !== 'object') return value as T;
  const map = value as Partial<Record<'base' | Breakpoint, T>>;
  let resolved = map.base;
  for (const [name, min] of Object.entries(BREAKPOINTS) as [Breakpoint, number][]) {
    if (width >= min && map[name] !== undefined) resolved = map[name];
  }
  return resolved;
}
