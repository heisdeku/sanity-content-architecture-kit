/** Type guard that drops null and undefined from arrays: `list.filter(isDefined)`. */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}
