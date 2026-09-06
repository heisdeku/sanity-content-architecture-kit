import "server-only";
import { env } from "@/env";
import {
  getDraftInventory,
  type InventoryEntry,
} from "@/features/agents/inventory";
import { agentClient, previewClient } from "@/features/sanity/client";
import { siteOrigin } from "@/features/utils/absolute-url";
import { SINGLETON_IDS } from "@/sanity/config/constants";
import { LLMS_TXT_QUERY, SITE_QUERY } from "@/sanity/queries/documents/site";

/**
 * Deployed schema id for Agent Actions: `_.schemas.<workspace name>`. The
 * workspace in sanity.config.ts is named "default". Run `npx sanity schema deploy`
 * once per project so the id exists.
 */
export const SCHEMA_ID = "_.schemas.default";

export type GenerateLlmsTxtResult =
  | { ok: true; llmsTxt: string }
  | { ok: false; status: number; error: string; code: string; hint?: string };

const INSTRUCTION = `You write the llms.txt file for the website "$siteName" ($siteOrigin).
An llms.txt is a short Markdown index that helps AI agents discover the pages of a site.

Format, exactly:
1. A first line "# $siteName".
2. A blockquote (lines starting with "> ") with a two to four sentence summary of what the site is about, based on the page inventory.
3. One or more "## " sections grouping the pages (for example "## Core pages", "## Articles", "## Legal"). Under each section, one line per page in the form "- [Title](URL): one sentence description".
4. A final "## Optional" section with one or two lines suggesting where an agent should start.
5. One closing line: "Every page above also answers in Markdown when requested with the HTTP header Accept: text/markdown."

Rules:
- Use ONLY the URLs from the inventory below, copied exactly. Never invent, shorten or change a URL. Every page in the inventory must appear once.
- Write plain Markdown. No HTML, no code fences, no front matter.
- Keep descriptions factual and under 25 words.

Editor guidance (follow it when it does not conflict with the rules):
$guidance

Page inventory (JSON, one object per page):
$inventory`;

function formatInventory(entries: InventoryEntry[]) {
  return JSON.stringify(
    entries.map((e) => ({
      title: e.title,
      url: e.url,
      type: e.type,
      excerpt: e.excerpt ?? undefined,
    })),
    null,
    2,
  );
}

/** Reject any URL on this origin that is not in the inventory. Off-site links are left alone. */
export function findUnknownUrls(
  markdown: string,
  entries: InventoryEntry[],
): string[] {
  const known = new Set(entries.map((e) => e.url.replace(/\/$/, "")));
  const origin = siteOrigin();
  const unknown = new Set<string>();
  for (const match of markdown.matchAll(/\((https?:\/\/[^)\s]+)\)/g)) {
    const url = (match[1] ?? "").replace(/\/$/, "");
    if (url.startsWith(origin) && url !== origin && !known.has(url))
      unknown.add(url);
  }
  return Array.from(unknown);
}

export async function generateLlmsTxt(): Promise<GenerateLlmsTxtResult> {
  if (!env.SANITY_API_EDIT_TOKEN) {
    return {
      ok: false,
      status: 500,
      error: "SANITY_API_EDIT_TOKEN is not set",
      code: "not_configured",
    };
  }

  const [site, llms, inventory] = await Promise.all([
    previewClient.fetch(SITE_QUERY, {}, { cache: "no-store" }),
    previewClient.fetch(LLMS_TXT_QUERY, {}, { cache: "no-store" }),
    getDraftInventory(),
  ]);

  if (inventory.length === 0) {
    return {
      ok: false,
      status: 400,
      error: "No indexable pages",
      code: "empty_inventory",
      hint: "Publish a page first.",
    };
  }

  const result = await agentClient.agent.action.generate<{
    agents?: { llmsTxt?: string };
  }>({
    schemaId: SCHEMA_ID,
    documentId: SINGLETON_IDS.site,
    instruction: INSTRUCTION,
    instructionParams: {
      siteName: typeof site?.name === "string" ? site.name : "this site",
      siteOrigin: siteOrigin(),
      guidance: llms?.guidance?.trim() || "No extra guidance.",
      inventory: formatInventory(inventory),
    },
    target: { path: ["agents", "llmsTxt"], operation: "set" },
    temperature: 0.2,
    noWrite: true,
  });

  const llmsTxt = result.agents?.llmsTxt?.trim();
  if (!llmsTxt) {
    return {
      ok: false,
      status: 502,
      error: "The model returned no text",
      code: "empty_generation",
    };
  }

  const unknown = findUnknownUrls(llmsTxt, inventory);
  if (unknown.length > 0) {
    return {
      ok: false,
      status: 422,
      error: "Generated text contains URLs that are not in the inventory",
      code: "unknown_urls",
      hint: unknown.slice(0, 5).join(", "),
    };
  }

  return { ok: true, llmsTxt: `${llmsTxt}\n` };
}
