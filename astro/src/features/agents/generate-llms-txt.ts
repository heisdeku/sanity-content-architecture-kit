import { AGENT_INVENTORY_QUERY } from '@studio/queries/documents/agents';
import { LLMS_TXT_QUERY, SITE_QUERY } from '@studio/queries/documents/site';
import { env } from '@/env';
import { writeClient } from '@/features/sanity/client';
import { asString } from '@/features/utils/as-string';
import { buildInventory, LLMS_TXT_INSTRUCTION, validateOutputUrls } from './llms-txt';

/**
 * Agent Actions need the deployed schema id. The Studio workspace is named
 * "default" (sanity.config.ts), so the id is `_.schemas.default`. Deploy it
 * with `npx sanity schema deploy` (documented in docs/features/llms-txt.md).
 */
export const SCHEMA_ID = '_.schemas.default';

export type GenerateLlmsTxtResult =
  | { ok: true; llmsTxt: string; entries: number }
  | { ok: false; status: number; code: string; error: string; hint?: string };

/**
 * Generation reads with drafts overlaid so the draft reflects work in
 * progress; serving (/llms.txt) only ever returns the published field.
 */
export async function generateLlmsTxt(): Promise<GenerateLlmsTxtResult> {
  const draftsClient = writeClient.withConfig({ perspective: 'drafts' });
  const [rows, site, agents] = await Promise.all([
    draftsClient.fetch(AGENT_INVENTORY_QUERY),
    draftsClient.fetch(SITE_QUERY),
    draftsClient.fetch(LLMS_TXT_QUERY),
  ]);
  const inventory = buildInventory(rows ?? [], env.PUBLIC_URL);
  if (inventory.length === 0) {
    return {
      ok: false,
      status: 422,
      code: 'empty-inventory',
      error: 'No indexable pages to describe',
      hint: 'Publish at least one page first.',
    };
  }

  const result = await writeClient.agent.action.generate({
    schemaId: SCHEMA_ID,
    targetDocument: { operation: 'createIfNotExists', _id: 'drafts.site', _type: 'site' },
    instruction: LLMS_TXT_INSTRUCTION,
    instructionParams: {
      inventory: { type: 'constant', value: JSON.stringify(inventory) },
      siteName: { type: 'constant', value: asString(site?.name) ?? 'This site' },
      tagline: { type: 'constant', value: asString(site?.tagline) ?? '' },
      guidance: { type: 'constant', value: agents?.guidance ?? 'Neutral, factual, concise.' },
    },
    target: { path: ['agents', 'llmsTxt'], operation: 'set' },
    noWrite: true,
  });

  const llmsTxt = readGenerated(result);
  if (!llmsTxt) {
    return {
      ok: false,
      status: 502,
      code: 'empty-generation',
      error: 'The model returned no text',
    };
  }
  const validation = validateOutputUrls(llmsTxt, inventory, env.PUBLIC_URL);
  if (!validation.ok) {
    return {
      ok: false,
      status: 422,
      code: 'invalid-urls',
      error: `Generated text contains URLs outside the inventory: ${validation.invalid.join(', ')}`,
      hint: 'Run Generate again. URLs must come from the inventory exactly as written.',
    };
  }
  return { ok: true, llmsTxt, entries: inventory.length };
}

function readGenerated(result: unknown): string | null {
  const doc = result as { agents?: { llmsTxt?: unknown } } | null;
  const value = doc?.agents?.llmsTxt;
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}
