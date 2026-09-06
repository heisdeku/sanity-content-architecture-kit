import { createHmac, timingSafeEqual } from 'node:crypto';

export const MIN_ELAPSED_MS = 3_000;
export const MAX_ELAPSED_MS = 24 * 60 * 60 * 1000;

function sign(timestamp: string, secret: string): string {
  return createHmac('sha256', secret).update(timestamp).digest('hex');
}

/** Issued at render time and posted back with the form as `_t`. */
export function createTimingToken(secret: string, now = Date.now()): string {
  const timestamp = String(now);
  return `${timestamp}.${sign(timestamp, secret)}`;
}

export type TimingVerdict =
  | { ok: true; elapsedMs: number }
  | { ok: false; reason: 'malformed' | 'invalid-signature' | 'too-fast' | 'expired' };

export function verifyTimingToken(token: string, secret: string, now = Date.now()): TimingVerdict {
  const [timestamp, signature] = token.split('.');
  if (!timestamp || !signature || !/^\d+$/.test(timestamp))
    return { ok: false, reason: 'malformed' };
  const expected = Buffer.from(sign(timestamp, secret));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
    return { ok: false, reason: 'invalid-signature' };
  }
  const elapsedMs = now - Number(timestamp);
  if (elapsedMs < MIN_ELAPSED_MS) return { ok: false, reason: 'too-fast' };
  if (elapsedMs > MAX_ELAPSED_MS) return { ok: false, reason: 'expired' };
  return { ok: true, elapsedMs };
}
