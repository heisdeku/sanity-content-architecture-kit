import { toPlainText } from '@portabletext/toolkit';

/**
 * Deterministic Markdown serializer (spec section 7). It walks any object
 * recursively and renders by factory-guaranteed object name:
 *   appHeading, appRichText, appMedia, appLink, appButton
 * plus the string conventions title / eyebrow / description and item arrays
 * (FAQ, logos). No per-section branching: a new section built from the
 * factories serializes with no new code.
 */
export type SerializerContext = {
  baseUrl: string;
  /** appLink -> absolute href. Provided by features/sanity/resolve-link. */
  resolveLink: (link: Record<string, unknown>) => string | null;
  /** Sanity image source -> URL. Provided by features/sanity/image. */
  imageUrl: (image: unknown) => string | null;
};

type Unknown = Record<string, unknown>;
const isObject = (value: unknown): value is Unknown =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const str = (value: unknown): string | null =>
  typeof value === 'string' && value.trim() ? value.trim() : null;

/* ----------------------------------------------------------------------------
 * PROJECT EXTENSION POINT
 * Add project-specific object types here. Return a Markdown string to take
 * over rendering for that node, or null to let the generic walk continue.
 * ------------------------------------------------------------------------- */
function renderProjectSpecific(_node: Unknown, _ctx: SerializerContext): string | null {
  return null;
}

export function serializeDocumentToMarkdown(doc: Unknown, ctx: SerializerContext): string {
  const parts: string[] = [];
  const title = str(doc.title);
  if (title) parts.push(`# ${title}`);
  const excerpt = str(doc.excerpt);
  if (excerpt) parts.push(`> ${excerpt}`);

  const body = Array.isArray(doc.pageBuilder)
    ? doc.pageBuilder
    : Array.isArray(doc.body)
      ? [doc.body]
      : [];
  for (const section of body) parts.push(renderNode(section, ctx, 2));
  if (!Array.isArray(doc.pageBuilder) && !Array.isArray(doc.body))
    parts.push(renderNode(doc, ctx, 2));

  return `${parts
    .filter(Boolean)
    .join('\n\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()}\n`;
}

export function renderNode(node: unknown, ctx: SerializerContext, level: number): string {
  if (Array.isArray(node)) {
    if (isPortableText(node)) return portableTextToMarkdown(node, ctx);
    return node
      .map((item) => renderNode(item, ctx, level))
      .filter(Boolean)
      .join('\n\n');
  }
  if (!isObject(node)) return '';

  const custom = renderProjectSpecific(node, ctx);
  if (custom !== null) return custom;

  switch (node._type) {
    case 'appHeading':
      return renderHeading(node, level);
    case 'appRichText':
      return renderNode(node.content ?? node.value ?? [], ctx, level);
    case 'appMedia':
      return renderMedia(node, ctx);
    case 'appLink':
      return renderLink(node, ctx) ?? '';
    case 'appButton':
      return renderLink(isObject(node.link) ? node.link : node, ctx, str(node.label)) ?? '';
    case 'block':
      return portableTextToMarkdown([node], ctx);
    default:
      break;
  }

  const out: string[] = [];
  const eyebrow = str(node.eyebrow);
  if (eyebrow) out.push(`*${eyebrow}*`);
  if (isObject(node.heading)) out.push(renderHeading(node.heading, level));
  else if (str(node.heading)) out.push(`${'#'.repeat(level)} ${str(node.heading)}`);
  else if (str(node.title) && node._type !== undefined)
    out.push(`${'#'.repeat(level)} ${str(node.title)}`);
  const description = node.description;
  if (typeof description === 'string' && description.trim()) out.push(description.trim());
  else if (Array.isArray(description)) out.push(renderNode(description, ctx, level + 1));
  const question = str(node.question);
  if (question) out.push(`${'#'.repeat(Math.min(level + 1, 6))} ${question}`);
  const answer = node.answer;
  if (answer) out.push(renderNode(answer, ctx, level + 1));

  const handled = new Set([
    '_type',
    '_key',
    '_id',
    'eyebrow',
    'heading',
    'title',
    'description',
    'question',
    'answer',
    'seo',
    'agents',
    'security',
    'uri',
    'slug',
  ]);
  for (const [key, value] of Object.entries(node)) {
    if (handled.has(key) || value === null || value === undefined) continue;
    if (isObject(value) || Array.isArray(value)) {
      const rendered = renderNode(value, ctx, Math.min(level + 1, 6));
      if (rendered) out.push(rendered);
    }
  }
  return out.filter(Boolean).join('\n\n');
}

function renderHeading(node: Unknown, level: number): string {
  const text = str(node.text);
  if (!text) return '';
  const explicit =
    typeof node.level === 'number' ? node.level : Number.parseInt(String(node.level ?? ''), 10);
  const depth = Math.min(Math.max(Number.isFinite(explicit) ? explicit : level, 1), 6);
  return `${'#'.repeat(depth)} ${text}`;
}

function renderMedia(node: Unknown, ctx: SerializerContext): string {
  const alt = str(node.alt) ?? '';
  const kind = str(node.kind);
  if (kind === 'image' || (!kind && node.image)) {
    const url = ctx.imageUrl(node.image);
    return url ? `![${alt}](${url})` : '';
  }
  if (kind === 'video') {
    const video = isObject(node.video) ? node.video : null;
    const playbackId = video ? str(video.playbackId) : null;
    return playbackId ? `[${alt || 'Watch video'}](https://stream.mux.com/${playbackId}.m3u8)` : '';
  }
  const asset = isObject(node.lottie) ? node.lottie : isObject(node.rive) ? node.rive : null;
  const url = asset ? str(asset.url) : null;
  return url ? `[${alt || `${kind ?? 'media'} animation`}](${url})` : '';
}

function renderLink(
  node: Unknown,
  ctx: SerializerContext,
  labelOverride?: string | null,
): string | null {
  const href = ctx.resolveLink(node);
  const label = labelOverride ?? str(node.label) ?? href;
  if (!href || !label) return null;
  return `[${label}](${href})`;
}

function isPortableText(value: unknown[]): value is Unknown[] {
  return (
    value.length > 0 &&
    value.every(
      (item) => isObject(item) && (item._type === 'block' || typeof item._type === 'string'),
    )
  );
}

function portableTextToMarkdown(blocks: Unknown[], ctx: SerializerContext): string {
  const out: string[] = [];
  let listBuffer: string[] = [];
  const flushList = () => {
    if (listBuffer.length) out.push(listBuffer.join('\n'));
    listBuffer = [];
  };
  for (const block of blocks) {
    if (block._type !== 'block') {
      flushList();
      out.push(renderNode(block, ctx, 3));
      continue;
    }
    const text = spansToMarkdown(block, ctx);
    if (block.listItem) {
      const marker = block.listItem === 'number' ? '1.' : '-';
      const indent = '  '.repeat(Math.max(0, (Number(block.level) || 1) - 1));
      listBuffer.push(`${indent}${marker} ${text}`);
      continue;
    }
    flushList();
    const style = str(block.style) ?? 'normal';
    const headingMatch = /^h([1-6])$/.exec(style);
    if (headingMatch) out.push(`${'#'.repeat(Number(headingMatch[1]))} ${text}`);
    else if (style === 'blockquote') out.push(`> ${text}`);
    else out.push(text);
  }
  flushList();
  return out.filter(Boolean).join('\n\n');
}

function spansToMarkdown(block: Unknown, ctx: SerializerContext): string {
  const markDefs = Array.isArray(block.markDefs) ? (block.markDefs as Unknown[]) : [];
  const children = Array.isArray(block.children) ? (block.children as Unknown[]) : [];
  return (
    children
      .map((child) => {
        let text = typeof child.text === 'string' ? child.text : '';
        if (!text) return '';
        const marks = Array.isArray(child.marks) ? (child.marks as string[]) : [];
        for (const mark of marks) {
          if (mark === 'strong') text = `**${text}**`;
          else if (mark === 'em') text = `*${text}*`;
          else if (mark === 'code') text = `\`${text}\``;
          else {
            const def = markDefs.find((d) => d._key === mark);
            if (!def) continue;
            const link = def._type === 'appLink' ? def : isObject(def.link) ? def.link : def;
            const href = ctx.resolveLink(link);
            if (href) text = `[${text}](${href})`;
          }
        }
        return text;
      })
      .join('')
      .trim() || toPlainText([block as never])
  );
}
