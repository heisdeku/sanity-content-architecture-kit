import { createHmac, timingSafeEqual } from 'node:crypto';
import type { AstroCookies } from 'astro';
import { env } from '@/env';

/**
 * Draft mode is a signed httpOnly cookie. The value is an HMAC of a constant
 * keyed with the viewer token, so it cannot be forged without the token and
 * it invalidates automatically when the token rotates. No extra secret needed.
 */
export const DRAFT_COOKIE = 'kit-draft-mode';
const PAYLOAD = 'draft-mode:v1';

function expectedValue(): string | null {
  if (!env.SANITY_API_VIEW_TOKEN) return null;
  return createHmac('sha256', env.SANITY_API_VIEW_TOKEN).update(PAYLOAD).digest('hex');
}

export function isDraftMode(cookies: AstroCookies): boolean {
  const value = cookies.get(DRAFT_COOKIE)?.value;
  const expected = expectedValue();
  if (!value || !expected || value.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(value), Buffer.from(expected));
}

export function enableDraftMode(cookies: AstroCookies): boolean {
  const value = expectedValue();
  if (!value) return false;
  cookies.set(DRAFT_COOKIE, value, {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    path: '/',
    maxAge: 60 * 60 * 8,
  });
  return true;
}

export function disableDraftMode(cookies: AstroCookies): void {
  cookies.delete(DRAFT_COOKIE, { path: '/' });
}
