import type { APIRoute } from 'astro';
import { env } from '@/env';
import { generateLlmsTxt } from '@/features/agents/generate-llms-txt';
import { isSameOrigin } from '@/features/agents/same-origin';
import { hasEditToken, writeClient } from '@/features/sanity/client';
import { apiError, apiJson } from '@/features/utils/api-error';

/**
 * Studio button on the Site document: builds the inventory in code, asks
 * Sanity Agent Actions for the editorial index, validates every URL against
 * the inventory and writes `agents.llmsTxt` on the draft.
 */
export const POST: APIRoute = async ({ request, cache }) => {
  cache.set(false);
  if (!isSameOrigin(request, env.PUBLIC_URL))
    return apiError(403, 'forbidden', 'Same-origin requests only');
  if (!hasEditToken)
    return apiError(500, 'missing-edit-token', 'SANITY_API_EDIT_TOKEN is required');

  let result: Awaited<ReturnType<typeof generateLlmsTxt>>;
  try {
    result = await generateLlmsTxt();
  } catch (error) {
    console.error('[llms-txt] generation failed', error);
    return apiError(
      502,
      'generation-failed',
      error instanceof Error ? error.message : 'Generation failed',
      'Deploy the schema with `npx sanity schema deploy` and check the edit token.',
    );
  }
  if (!result.ok) return apiError(result.status, result.code, result.error, result.hint);

  try {
    await writeClient.patch('drafts.site').set({ 'agents.llmsTxt': result.llmsTxt }).commit();
  } catch {
    // The Studio input applies the value to the open form when no draft exists.
  }
  return apiJson({ llmsTxt: result.llmsTxt, entries: result.entries });
};
