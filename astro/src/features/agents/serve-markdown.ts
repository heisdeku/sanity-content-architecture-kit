import { AGENT_INVENTORY_QUERY, MARKDOWN_BY_PATH_QUERY } from '@studio/queries/documents/agents';
import { env } from '@/env';
import { publicClient } from '@/features/sanity/client';
import { documentTags, typeTag } from '@/features/sanity/tags';
import { notFoundMarkdown } from './not-found-markdown';

export type MarkdownDecision =
  | { kind: 'markdown'; body: string; tags: string[] }
  | { kind: 'not-found'; body: string }
  | { kind: 'unavailable'; body: string }
  | { kind: 'html' };

const HOT_TTL_MS = 60_000;
const hot = new Map<string, { expiresAt: number; value: MarkdownDecision }>();

/**
 * Decides what an agent asking for text/markdown receives at a path:
 * the stored, published `agents.markdown` (when `serveMarkdown` is on and
 * the document is not password protected), the recovery map (no document),
 * or the HTML page (document exists but Markdown is off or empty).
 * Reads hit a 60 s hot cache so agents barely touch the API; the revalidate
 * webhook clears it.
 */
export async function decideMarkdown(path: string): Promise<MarkdownDecision> {
  const cached = hot.get(path);
  if (cached && cached.expiresAt > Date.now()) return cached.value;
  const value = await compute(path);
  if (value.kind === 'unavailable') return value;
  if (hot.size > 500) hot.clear();
  hot.set(path, { expiresAt: Date.now() + HOT_TTL_MS, value });
  return value;
}

async function compute(path: string): Promise<MarkdownDecision> {
  try {
    const doc = await publicClient.fetch(MARKDOWN_BY_PATH_QUERY, { path });
    if (!doc) return { kind: 'not-found', body: await buildNotFound(path) };
    if (!doc.serveMarkdown || doc.passwordProtect || !doc.markdown?.trim()) return { kind: 'html' };
    return { kind: 'markdown', body: doc.markdown, tags: documentTags(doc, doc.path) };
  } catch (error) {
    console.warn(
      '[agents] markdown lookup failed:',
      error instanceof Error ? error.message : error,
    );
    // Never cache an outage: decideMarkdown skips the hot cache for this kind.
    return {
      kind: 'unavailable',
      body: await buildNotFound(
        path,
        'The content service is unavailable right now. Retry shortly; the discovery URLs below still resolve.',
      ),
    };
  }
}

export async function buildNotFound(path: string, intro?: string): Promise<string> {
  let pages: { title: string; path: string }[] = [];
  let siteName = 'This site';
  let llmsTxtEnabled = false;
  try {
    const [inventory, site] = await Promise.all([
      publicClient.fetch(AGENT_INVENTORY_QUERY),
      publicClient.fetch<{ name?: string; serve?: boolean } | null>(
        '*[_id == "site"][0]{ name, "serve": agents.serveLlmsTxt == true }',
      ),
    ]);
    pages = (inventory ?? [])
      .filter((entry) => typeof entry.path === 'string' && entry.title)
      .slice(0, 12)
      .map((entry) => ({ title: entry.title as string, path: entry.path as string }));
    siteName = site?.name ?? siteName;
    llmsTxtEnabled = Boolean(site?.serve);
  } catch {
    // Unreachable Sanity still gets a useful map with the discovery URLs.
  }
  return notFoundMarkdown({
    siteName,
    baseUrl: env.PUBLIC_URL,
    requestedPath: path,
    pages,
    llmsTxtEnabled,
    intro,
  });
}

export function markdownResponse(
  body: string,
  { status = 200, tags = [] as string[] } = {},
): Response {
  return new Response(body, {
    status,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control':
        status === 200 ? 'public, s-maxage=60, stale-while-revalidate=600' : 'private, no-store',
      Vary: 'Cookie, Authorization, Accept',
      ...(tags.length ? { 'X-Cache-Tags': tags.join(',') } : {}),
    },
  });
}

export function clearMarkdownCache(): void {
  hot.clear();
}

export const INVENTORY_TAG = typeTag('inventory');
