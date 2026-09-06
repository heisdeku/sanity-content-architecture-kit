import { previewClient } from "@/features/sanity/client";
import { publishedFetch, safe } from "@/features/sanity/fetch";
import { typeTag } from "@/features/sanity/tags";
import { absoluteUrl } from "@/features/utils/absolute-url";
import { AGENT_INVENTORY_QUERY } from "@/sanity/queries/documents/agents";

export type InventoryEntry = {
  id: string;
  type: string;
  title: string;
  url: string;
  path: string;
  excerpt: string | null;
};

const ROUTED_TYPES = ["homepage", "page", "article", "legalPage"];

function toEntries(
  rows: Array<{
    _id: string;
    _type: string;
    title: string | null;
    path: string | null;
    excerpt: string | null;
  }>,
) {
  const entries: InventoryEntry[] = [];
  for (const row of rows) {
    if (!row.path) continue;
    entries.push({
      id: row._id,
      type: row._type,
      title: row.title ?? row.path,
      url: absoluteUrl(row.path),
      path: row.path,
      excerpt: row.excerpt ?? null,
    });
  }
  return entries;
}

/** Published inventory (agent 404 map). Empty on failure. */
export async function getPublishedInventory(): Promise<InventoryEntry[]> {
  const { data } = await safe(
    publishedFetch({
      query: AGENT_INVENTORY_QUERY,
      tags: ROUTED_TYPES.map(typeTag),
    }),
  );
  return toEntries(data ?? []);
}

/** Inventory with drafts overlaid (llms.txt generation). Throws on failure. */
export async function getDraftInventory(): Promise<InventoryEntry[]> {
  const rows = await previewClient.fetch(
    AGENT_INVENTORY_QUERY,
    {},
    { cache: "no-store" },
  );
  return toEntries(rows);
}

/** Top pages for the 404 map: homepage first, then pages, then a few articles. */
export function topPages(entries: InventoryEntry[], limit = 8) {
  const order = ["homepage", "page", "article", "legalPage"];
  return [...entries]
    .sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type))
    .slice(0, limit)
    .map((entry) => ({ title: entry.title, url: entry.url }));
}
