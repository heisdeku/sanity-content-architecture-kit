import type { SerializeContext } from "@/features/agents/serialize-context";

type Span = { _type: "span"; text: string; marks?: string[] };
type MarkDef = { _key: string; _type: string; [key: string]: unknown };
type Block = {
  _type: "block";
  style?: string;
  listItem?: string;
  level?: number;
  children?: Span[];
  markDefs?: MarkDef[];
};
type Node = Block | { _type: string; [key: string]: unknown };

export function isPortableTextArray(value: unknown): value is Node[] {
  return (
    Array.isArray(value) &&
    value.some((item) => item && typeof item === "object" && "_type" in item)
  );
}

function renderSpan(
  span: Span,
  markDefs: MarkDef[],
  ctx: SerializeContext,
): string {
  let text = span.text;
  if (!text) return "";
  for (const mark of span.marks ?? []) {
    if (mark === "strong") text = `**${text}**`;
    else if (mark === "em") text = `*${text}*`;
    else if (mark === "code") text = `\`${text}\``;
    else if (mark === "strike-through") text = `~~${text}~~`;
    else {
      const def = markDefs.find((d) => d._key === mark);
      if (def) {
        const href = ctx.resolveHref(def);
        if (href) text = `[${text}](${href})`;
      }
    }
  }
  return text;
}

function renderBlock(block: Block, ctx: SerializeContext): string {
  const inner = (block.children ?? [])
    .map((span) => renderSpan(span, block.markDefs ?? [], ctx))
    .join("");
  if (block.listItem) {
    const indent = "  ".repeat(Math.max(0, (block.level ?? 1) - 1));
    const bullet = block.listItem === "number" ? "1." : "-";
    return `${indent}${bullet} ${inner}`;
  }
  switch (block.style) {
    case "h1":
      return `# ${inner}`;
    case "h2":
      return `## ${inner}`;
    case "h3":
      return `### ${inner}`;
    case "h4":
      return `#### ${inner}`;
    case "h5":
      return `##### ${inner}`;
    case "h6":
      return `###### ${inner}`;
    case "blockquote":
      return `> ${inner}`;
    default:
      return inner;
  }
}

/** Portable Text array to Markdown. Custom block types defer to the serializer. */
export function portableTextToMarkdown(
  nodes: Node[],
  ctx: SerializeContext,
): string {
  const out: string[] = [];
  let previousWasList = false;

  for (const node of nodes) {
    if (node._type === "block") {
      const block = node as Block;
      const line = renderBlock(block, ctx);
      const isList = Boolean(block.listItem);
      if (isList && previousWasList)
        out[out.length - 1] = `${out[out.length - 1]}\n${line}`;
      else out.push(line);
      previousWasList = isList;
      continue;
    }
    previousWasList = false;
    const rendered = ctx.serializeNode(node);
    if (rendered) out.push(rendered);
  }

  return out.filter(Boolean).join("\n\n");
}
