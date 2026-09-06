type Span = { _type?: string; text?: string };
type Block = { _type?: string; children?: Span[] };

/**
 * Flattens a Portable Text array to plain text. Used by Studio previews
 * (section subtitles) and by validation rules that need a length.
 */
export function portableTextToPlain(value: unknown, separator = " "): string {
  if (!Array.isArray(value)) return "";
  return (value as Block[])
    .filter(
      (block) => block?._type === "block" && Array.isArray(block.children),
    )
    .map((block) =>
      (block.children ?? [])
        .map((child) => (typeof child?.text === "string" ? child.text : ""))
        .join(""),
    )
    .filter(Boolean)
    .join(separator)
    .trim();
}

export function truncate(text: string, max = 80): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}
