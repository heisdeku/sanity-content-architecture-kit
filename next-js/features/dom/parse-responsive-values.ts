import type { Breakpoint } from "@/features/dom/constants";

export type ResponsiveValue<T> = T | Partial<Record<"base" | Breakpoint, T>>;

/**
 * Normalise `value` or `{ base, md, lg }` into a full map keyed by breakpoint.
 * Missing keys inherit from the previous (smaller) breakpoint.
 */
export function parseResponsiveValues<T>(
  input: ResponsiveValue<T>,
): Record<"base" | Breakpoint, T> {
  const order = ["base", "sm", "md", "lg", "xl", "2xl"] as const;
  const isMap =
    typeof input === "object" && input !== null && "base" in (input as object);
  const map = (isMap ? input : { base: input }) as Partial<
    Record<(typeof order)[number], T>
  >;

  const result = {} as Record<(typeof order)[number], T>;
  let current = map.base as T;
  for (const key of order) {
    if (map[key] !== undefined) current = map[key] as T;
    result[key] = current;
  }
  return result;
}
