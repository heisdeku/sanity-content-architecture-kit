import {
  isPortableTextArray,
  portableTextToMarkdown,
} from "@/features/agents/portable-text-to-markdown";
import type { SerializeContext } from "@/features/agents/serialize-context";

/**
 * Deterministic Markdown serializer.
 *
 * It walks any object recursively and renders by factory name (`_type`):
 * appHeading, appRichText (Portable Text arrays), appMedia, appLink, appButton,
 * plus string conventions (title, eyebrow, description, text, label, question,
 * answer). There is no per-section branching, so a new section built from the
 * factories serializes with no new code here.
 */

type AnyRecord = Record<string, unknown>;

/* ------------------------------------------------------------------------ */
/* EXTENSION POINT                                                          */
/* Add project-specific `_type` renderers here. Each receives the node and   */
/* the context and returns Markdown (or an empty string to skip it). This is */
/* the only place a project should touch.                                    */
/* ------------------------------------------------------------------------ */
export const PROJECT_SERIALIZERS: Record<
  string,
  (node: AnyRecord, ctx: SerializeContext) => string
> = {
  // example: pricingTier: (node) => `- **${node.name}**: ${node.price}`,
};

const STRING_CONVENTIONS: Record<string, (value: string) => string> = {
  eyebrow: (value) => `*${value}*`,
  title: (value) => `## ${value}`,
  heading: (value) => `## ${value}`,
  subtitle: (value) => `### ${value}`,
  description: (value) => value,
  text: (value) => value,
  label: (value) => value,
  question: (value) => `**${value}**`,
  answer: (value) => value,
  caption: (value) => `*${value}*`,
  quote: (value) => `> ${value}`,
  author: (value) => `*${value}*`,
};

const SKIP_KEYS = new Set([
  "_type",
  "_key",
  "_id",
  "_rev",
  "_createdAt",
  "_updatedAt",
  "seo",
  "agents",
  "security",
  "settings",
  "layout",
  "variant",
  "theme",
  "background",
  "align",
  "alignment",
  "columns",
  "spacing",
  "kind",
  "width",
  "height",
  "aspectRatio",
  "customRatio",
  "newTab",
  "download",
  "level",
]);

function isRecord(value: unknown): value is AnyRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Accepts `2`, `"2"` or `"h2"` (the appHeading level format). */
function headingLevel(level: unknown, fallback: number) {
  const raw = typeof level === "number" ? String(level) : String(level ?? "");
  const match = /^h?([1-6])$/.exec(raw.trim().toLowerCase());
  return match ? Number(match[1]) : fallback;
}

function renderByType(
  node: AnyRecord,
  ctx: SerializeContext,
  depth: number,
): string | null {
  const type = typeof node._type === "string" ? node._type : undefined;
  if (!type) return null;

  const project = PROJECT_SERIALIZERS[type];
  if (project) return project(node, ctx);

  switch (type) {
    case "appHeading": {
      const text = typeof node.text === "string" ? node.text.trim() : "";
      if (!text) return "";
      return `${"#".repeat(headingLevel(node.level, depth === 0 ? 2 : 3))} ${text}`;
    }
    case "appLink": {
      const href = ctx.resolveHref(node);
      const label =
        typeof node.label === "string" && node.label ? node.label : href;
      return href ? `[${label}](${href})` : "";
    }
    case "appButton": {
      const link = isRecord(node.link) ? node.link : node;
      const href = ctx.resolveHref(link);
      const label =
        typeof node.label === "string"
          ? node.label
          : typeof link.label === "string"
            ? link.label
            : href;
      return href ? `[${label}](${href})` : "";
    }
    case "appMedia": {
      const url = ctx.resolveMediaUrl(node);
      if (!url) return "";
      const alt = typeof node.alt === "string" ? node.alt : "";
      return node.kind === "image"
        ? `![${alt}](${url})`
        : `[${alt || `Video (${String(node.kind)})`}](${url})`;
    }
    case "appIcon":
      return "";
    default:
      return null;
  }
}

function serializeValue(
  key: string,
  value: unknown,
  ctx: SerializeContext,
  depth: number,
): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") {
    const convention = STRING_CONVENTIONS[key];
    const trimmed = value.trim();
    if (!trimmed) return "";
    return convention ? convention(trimmed) : "";
  }
  if (typeof value === "number" || typeof value === "boolean") return "";
  if (Array.isArray(value)) {
    if (
      isPortableTextArray(value) &&
      value.some((n) => (n as AnyRecord)._type === "block")
    ) {
      return portableTextToMarkdown(
        value as Parameters<typeof portableTextToMarkdown>[0],
        ctx,
      );
    }
    return value
      .map((item) =>
        isRecord(item) ? serializeObject(item, ctx, depth + 1) : "",
      )
      .filter(Boolean)
      .join("\n\n");
  }
  if (isRecord(value)) return serializeObject(value, ctx, depth + 1);
  return "";
}

/** Serialize any object: factory types first, then walk keys in order. */
export function serializeObject(
  node: AnyRecord,
  ctx: SerializeContext,
  depth = 0,
): string {
  const byType = renderByType(node, ctx, depth);
  if (byType !== null) return byType;

  const parts: string[] = [];
  for (const [key, value] of Object.entries(node)) {
    if (SKIP_KEYS.has(key)) continue;
    const rendered = serializeValue(key, value, ctx, depth);
    if (rendered) parts.push(rendered);
  }
  return parts.join("\n\n");
}

export type SerializeDocumentInput = {
  title: string;
  /** Absolute canonical URL of the page. */
  url: string;
  description?: string | null;
  sections?: unknown[] | null;
  /** Extra top-level fields to include after the sections (article body, legal body). */
  extra?: Record<string, unknown>;
};

/** Document to Markdown: title, canonical link, then every section in order. */
export function serializeDocument(
  input: SerializeDocumentInput,
  ctx: SerializeContext,
): string {
  const parts: string[] = [`# ${input.title.trim()}`];
  if (input.description?.trim()) parts.push(input.description.trim());
  parts.push(`Canonical: ${input.url}`);

  for (const section of input.sections ?? []) {
    if (!isRecord(section)) continue;
    const rendered = serializeObject(section, ctx, 0);
    if (rendered) parts.push(rendered);
  }

  if (input.extra) {
    const rendered = serializeObject(input.extra, ctx, 0);
    if (rendered) parts.push(rendered);
  }

  return `${parts
    .join("\n\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()}\n`;
}

/** Build a context whose `serializeNode` recurses into this serializer. */
export function createSerializeContext(
  base: Omit<SerializeContext, "serializeNode">,
): SerializeContext {
  const ctx: SerializeContext = {
    ...base,
    serializeNode: (node) => serializeObject(node, ctx, 1),
  };
  return ctx;
}
