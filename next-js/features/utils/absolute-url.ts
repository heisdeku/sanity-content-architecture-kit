import { env } from "@/env";

/** Absolute URL for a site path. Paths already absolute pass through. */
export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//.test(path)) return path;
  const base = env.NEXT_PUBLIC_URL.replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Site origin without a trailing slash. */
export function siteOrigin(): string {
  return env.NEXT_PUBLIC_URL.replace(/\/$/, "");
}
