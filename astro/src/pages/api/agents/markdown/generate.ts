import { DOCUMENT_FOR_SERIALIZER_QUERY } from '@studio/queries/documents/agents';
import type { APIRoute } from 'astro';
import { env } from '@/env';
import { isSameOrigin } from '@/features/agents/same-origin';
import { serializeDocumentToMarkdown } from '@/features/agents/serialize-markdown';
import { hasEditToken, writeClient } from '@/features/sanity/client';
import { urlFor } from '@/features/sanity/image';
import { resolveLink } from '@/features/sanity/resolve-link';
import { apiError, apiJson, readJson } from '@/features/utils/api-error';

/**
 * Studio button: runs the deterministic serializer over the document (draft
 * or published, whichever id the Studio sent) and returns the Markdown.
 * When a draft exists it is also written to `agents.markdown` on the draft;
 * the Studio input applies the same value to the open form.
 */
export const POST: APIRoute = async ({ request, cache }) => {
  cache.set(false);
  if (!isSameOrigin(request, env.PUBLIC_URL))
    return apiError(403, 'forbidden', 'Same-origin requests only');
  if (!hasEditToken)
    return apiError(500, 'missing-edit-token', 'SANITY_API_EDIT_TOKEN is required');
  const body = await readJson<{ id?: string }>(request);
  const id = body?.id?.trim();
  if (!id) return apiError(400, 'missing-id', 'Body must be { id }');

  const raw = writeClient.withConfig({ perspective: 'raw' });
  let doc = await raw.fetch(DOCUMENT_FOR_SERIALIZER_QUERY, { id });
  if (!doc && !id.startsWith('drafts.'))
    doc = await raw.fetch(DOCUMENT_FOR_SERIALIZER_QUERY, { id: `drafts.${id}` });
  if (!doc) return apiError(404, 'not-found', 'Document not found');

  const markdown = serializeDocumentToMarkdown(doc as Record<string, unknown>, {
    baseUrl: env.PUBLIC_URL,
    resolveLink: (link) => resolveLink(link, { base: env.PUBLIC_URL })?.href ?? null,
    imageUrl: (image) => {
      try {
        return image
          ? urlFor(image as never)
              .width(1600)
              .url()
          : null;
      } catch {
        return null;
      }
    },
  });

  const draftId = id.startsWith('drafts.') ? id : `drafts.${id}`;
  try {
    await writeClient
      .patch(draftId)
      .set({ 'agents.markdown': markdown })
      .commit({ autoGenerateArrayKeys: true });
  } catch {
    // No draft yet: the Studio input writes the value into the form instead.
  }
  return apiJson({ markdown });
};
