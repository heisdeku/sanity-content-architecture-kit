import { toPlainText } from '@portabletext/toolkit';

/** Plain text of a Portable Text array, for excerpts and meta descriptions. */
export function richTextToPlain(value: unknown, maxLength?: number): string {
  if (!Array.isArray(value)) return '';
  const text = toPlainText(value as never)
    .replace(/\s+/g, ' ')
    .trim();
  if (!maxLength || text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}
