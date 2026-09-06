import { SITE_QUERY } from '@studio/queries/documents/site';
import type { APIRoute } from 'astro';
import { submitContact } from '@/features/forms/submit-contact';
import { publicClient } from '@/features/sanity/client';
import { apiError, apiJson, readJson } from '@/features/utils/api-error';

export const POST: APIRoute = async ({ request, cache }) => {
  cache.set(false);
  const body = await readJson(request);
  if (!body) return apiError(400, 'invalid-json', 'Body must be JSON');

  let recipients: string[] = [];
  let fromAddress: string | null | undefined;
  try {
    const site = await publicClient.fetch(SITE_QUERY);
    recipients = (site?.notifications?.recipients ?? []).filter(
      (r): r is string => typeof r === 'string',
    );
    fromAddress = site?.notifications?.fromAddress;
  } catch (error) {
    console.warn(
      '[contact] could not load recipients',
      error instanceof Error ? error.message : error,
    );
  }

  const result = await submitContact({ request, body, recipients, fromAddress });
  if (!result.ok) return apiError(result.status, result.code, result.error, result.hint);
  return apiJson({ ok: true });
};
