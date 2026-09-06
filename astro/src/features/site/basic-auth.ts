import { timingSafeEqual } from 'node:crypto';

/**
 * Basic Auth helpers. Credentials come from env, never from the CMS.
 * When credentials are missing, protection is reported as unavailable and the
 * middleware fails open with a warning rather than locking the site.
 */
export function hasBasicAuthCredentials(user?: string, password?: string): boolean {
  return Boolean(user && password);
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function checkBasicAuth(header: string | null, user: string, password: string): boolean {
  if (!header?.startsWith('Basic ')) return false;
  let decoded: string;
  try {
    decoded = Buffer.from(header.slice(6), 'base64').toString('utf8');
  } catch {
    return false;
  }
  const separator = decoded.indexOf(':');
  if (separator < 0) return false;
  const givenUser = decoded.slice(0, separator);
  const givenPassword = decoded.slice(separator + 1);
  // Compare both so timing never reveals which half was wrong.
  const userOk = safeEqual(givenUser, user);
  const passwordOk = safeEqual(givenPassword, password);
  return userOk && passwordOk;
}

export function unauthorizedResponse(realm = 'Protected'): Response {
  return new Response('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': `Basic realm="${realm}", charset="UTF-8"`,
      'Cache-Control': 'private, no-store',
      Vary: 'Cookie, Authorization, Accept',
    },
  });
}
