/**
 * HTTP basic auth helpers. Runtime-agnostic (no node: imports) so proxy.ts
 * can use them. Credentials come from env only, never from the CMS.
 */
export type BasicAuthCredentials = { user: string; password: string };

/** Constant-time string compare so response timing leaks nothing. */
export function timingSafeEqualString(a: string, b: string): boolean {
  const encoder = new TextEncoder();
  const bufA = encoder.encode(a);
  const bufB = encoder.encode(b);
  const length = Math.max(bufA.length, bufB.length);
  let mismatch = bufA.length === bufB.length ? 0 : 1;
  for (let i = 0; i < length; i += 1) {
    mismatch |= (bufA[i] ?? 0) ^ (bufB[i] ?? 0);
  }
  return mismatch === 0;
}

/** Parse `Authorization: Basic base64(user:password)`. */
export function parseBasicAuthHeader(
  header: string | null,
): BasicAuthCredentials | null {
  if (!header?.startsWith("Basic ")) return null;
  try {
    const decoded = atob(header.slice(6).trim());
    const index = decoded.indexOf(":");
    if (index === -1) return null;
    return {
      user: decoded.slice(0, index),
      password: decoded.slice(index + 1),
    };
  } catch {
    return null;
  }
}

export function isAuthorized(
  header: string | null,
  expected: BasicAuthCredentials,
): boolean {
  const supplied = parseBasicAuthHeader(header);
  if (!supplied) return false;
  const userOk = timingSafeEqualString(supplied.user, expected.user);
  const passOk = timingSafeEqualString(supplied.password, expected.password);
  return userOk && passOk;
}

export function unauthorizedResponse(realm = "Protected"): Response {
  return new Response("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": `Basic realm="${realm}", charset="UTF-8"`,
      "Cache-Control": "private, no-store",
    },
  });
}
