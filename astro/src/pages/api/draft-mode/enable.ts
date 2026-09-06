import { validatePreviewUrl } from '@sanity/preview-url-secret';
import type { APIRoute } from 'astro';
import { enableDraftMode } from '@/features/draft-mode/cookie';
import { hasViewToken, previewClient } from '@/features/sanity/client';
import { apiError } from '@/features/utils/api-error';

/**
 * Presentation opens this URL with a short-lived secret. The secret is
 * validated against the dataset (same mechanism next-sanity uses), then the
 * signed draft cookie is set and the editor is redirected to the page.
 */
export const GET: APIRoute = async ({ request, cookies, redirect }) => {
  if (!hasViewToken) {
    return apiError(500, 'missing-view-token', 'SANITY_API_VIEW_TOKEN is required for draft mode');
  }
  let result: Awaited<ReturnType<typeof validatePreviewUrl>>;
  try {
    result = await validatePreviewUrl(previewClient, request.url);
  } catch (error) {
    console.warn('[draft-mode] secret validation failed', error);
    return apiError(
      503,
      'sanity-unreachable',
      'Could not validate the preview secret',
      'Check the Sanity project configuration.',
    );
  }
  if (!result.isValid) {
    return apiError(
      401,
      'invalid-secret',
      'Invalid preview secret',
      'Open the preview from the Studio Presentation tool.',
    );
  }
  enableDraftMode(cookies);
  return redirect(result.redirectTo || '/', 307);
};
