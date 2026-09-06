import { toPlainText } from "@portabletext/react";

/** Plain text from a Portable Text array, or an empty string. */
export function plainText(value: unknown): string {
  if (!Array.isArray(value) || value.length === 0) return "";
  try {
    return toPlainText(value as Parameters<typeof toPlainText>[0]);
  } catch {
    return "";
  }
}

export function excerpt(value: unknown, max = 160): string {
  const text = plainText(value).replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}
