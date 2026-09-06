import { isValidSignature, SIGNATURE_HEADER_NAME } from '@sanity/webhook';

export type RevalidatePayload = { _type: string; _id: string; uri?: string | null };

export type WebhookVerdict =
  | { ok: true; payload: RevalidatePayload }
  | { ok: false; status: number; code: string; error: string };

/**
 * Validates the @sanity/webhook signature (SANITY_REVALIDATE_SECRET) and the
 * projection `{ _type, _id, "uri": coalesce(uri.current, slug.current) }`.
 */
export async function readSignedWebhook(
  request: Request,
  secret: string | undefined,
): Promise<WebhookVerdict> {
  if (!secret)
    return {
      ok: false,
      status: 500,
      code: 'missing-secret',
      error: 'SANITY_REVALIDATE_SECRET is not set',
    };
  const signature = request.headers.get(SIGNATURE_HEADER_NAME);
  if (!signature)
    return { ok: false, status: 401, code: 'missing-signature', error: 'Missing signature header' };
  const body = await request.text();
  const valid = await isValidSignature(body, signature, secret);
  if (!valid)
    return { ok: false, status: 401, code: 'invalid-signature', error: 'Invalid signature' };
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return { ok: false, status: 400, code: 'invalid-json', error: 'Body is not JSON' };
  }
  if (!isPayload(payload)) {
    return {
      ok: false,
      status: 400,
      code: 'invalid-payload',
      error: 'Expected { _type, _id, uri? }',
    };
  }
  return { ok: true, payload };
}

function isPayload(value: unknown): value is RevalidatePayload {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return typeof v._type === 'string' && typeof v._id === 'string';
}
