/**
 * Generate endpoints are called by Studio input components on the same
 * origin. Accept when Origin (or the Referer origin) matches PUBLIC_URL or
 * the request's own origin (local development on another port).
 */
export function isSameOrigin(request: Request, publicUrl: string): boolean {
  const allowed = new Set<string>();
  try {
    allowed.add(new URL(publicUrl).origin);
  } catch {
    // ignore malformed PUBLIC_URL, the request origin still counts
  }
  try {
    allowed.add(new URL(request.url).origin);
  } catch {
    // ignore
  }
  const origin = request.headers.get('origin');
  if (origin) return allowed.has(origin);
  const referer = request.headers.get('referer');
  if (referer) {
    try {
      return allowed.has(new URL(referer).origin);
    } catch {
      return false;
    }
  }
  return false;
}
