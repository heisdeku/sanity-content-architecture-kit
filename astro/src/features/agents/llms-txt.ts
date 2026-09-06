import { absoluteUrl } from '@/features/utils/absolute-url';

export type InventoryEntry = { title: string; url: string; excerpt: string; type: string };

export type InventoryRow = {
  _type: string;
  title?: unknown;
  path?: unknown;
  excerpt?: unknown;
};

/** Builds `{ title, url, excerpt }` entries in code. URLs never pass through a model. */
export function buildInventory(rows: InventoryRow[], baseUrl: string): InventoryEntry[] {
  const entries: InventoryEntry[] = [];
  for (const row of rows) {
    if (typeof row.title !== 'string' || !row.title.trim() || typeof row.path !== 'string')
      continue;
    entries.push({
      title: row.title.trim(),
      url: absoluteUrl(row.path, baseUrl),
      excerpt: typeof row.excerpt === 'string' ? row.excerpt.trim() : '',
      type: row._type,
    });
  }
  return entries;
}

/** Instruction for Agent Actions. `$inventory` and `$guidance` are constant params. */
export const LLMS_TXT_INSTRUCTION = [
  'Write the llms.txt file for this website following the llmstxt.org convention.',
  'Start with a level 1 heading with the site name, then a blockquote with a one paragraph summary.',
  'Group pages under level 2 headings such as "Core pages", "Articles" and "Optional".',
  'Every entry is a Markdown list item "- [Title](URL): one sentence description".',
  'Use ONLY the URLs given in $inventory, exactly as written, and do not invent, shorten or change any URL.',
  'Do not include pages that are not in $inventory.',
  'End with a line noting that every page is also available as Markdown by sending the header "Accept: text/markdown".',
  'Site name: $siteName. Site summary: $tagline.',
  'Editor guidance: $guidance',
  'Inventory (JSON): $inventory',
].join('\n');

const URL_PATTERN = /https?:\/\/[^\s)>\]"']+/g;

/** Every URL in the model output must be in the inventory (or the site root). */
export function validateOutputUrls(
  output: string,
  inventory: InventoryEntry[],
  baseUrl: string,
): { ok: true } | { ok: false; invalid: string[] } {
  const allowed = new Set(inventory.map((entry) => entry.url));
  const root = baseUrl.replace(/\/$/, '');
  allowed.add(root);
  allowed.add(`${root}/`);
  const invalid = new Set<string>();
  for (const match of output.match(URL_PATTERN) ?? []) {
    const url = match.replace(/[.,;:]+$/, '');
    if (!allowed.has(url)) invalid.add(url);
  }
  return invalid.size ? { ok: false, invalid: [...invalid] } : { ok: true };
}
