/**
 * Narrows a value to a non-empty string. Typegen cannot always tell which
 * document a singleton query returns, so fields like `site.name` arrive as
 * unions; this keeps the narrowing in one place.
 */
export function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}
