import { env } from "@/env";

/**
 * The Studio runs in the browser on the same origin as the app, so the
 * generate routes cannot hold a bearer secret. They accept same-origin
 * requests (Origin, else Referer) and use the server-held edit token. For
 * stronger guarantees put the Studio behind basic auth or Sanity login.
 */
export function isSameOrigin(request: Request): boolean {
  const expected = new URL(env.NEXT_PUBLIC_URL).origin;
  const origin = request.headers.get("origin");
  if (origin) return origin === expected;
  const referer = request.headers.get("referer");
  if (!referer) return false;
  try {
    return new URL(referer).origin === expected;
  } catch {
    return false;
  }
}
