import { createClient } from "@sanity/client";
import { env } from "@/env";
import { resolveLink } from "@/features/sanity/resolve-link";
import { ROUTED_PATHS_QUERY } from "@/sanity/queries/documents/agents";
import {
  REDIRECTS_QUERY,
  SITE_SECURITY_QUERY,
} from "@/sanity/queries/documents/site";

/**
 * Lookups for proxy.ts. The proxy has no Data Cache to lean on, so this is a
 * plain @sanity/client (useCdn false, published perspective) behind a 60s
 * in-memory cache keyed per query. Only fetch + Web APIs are used. A failed
 * lookup returns null ("unknown") so the proxy can fail open.
 */
const TTL_MS = 60_000;

const proxyClient = createClient({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: env.NEXT_PUBLIC_SANITY_API_VERSION,
  useCdn: false,
  perspective: "published",
});

type Entry<T> = { value: T; expiresAt: number };
const cache = new Map<string, Entry<unknown>>();

async function cached<T>(
  key: string,
  load: () => Promise<T>,
): Promise<T | null> {
  const now = Date.now();
  const hit = cache.get(key) as Entry<T> | undefined;
  if (hit && hit.expiresAt > now) return hit.value;
  try {
    const value = await load();
    cache.set(key, { value, expiresAt: now + TTL_MS });
    return value;
  } catch (error) {
    console.warn(
      `[proxy] lookup "${key}" failed:`,
      error instanceof Error ? error.message : error,
    );
    return hit?.value ?? null;
  }
}

export type SecurityState = {
  basicAuthEnabled: boolean;
  protectedPaths: string[];
};
export type RedirectRule = { from: string; to: string; permanent: boolean };

export function getSecurity(): Promise<SecurityState | null> {
  return cached("security", async () => {
    const result = await proxyClient.fetch(SITE_SECURITY_QUERY);
    return {
      basicAuthEnabled: result.basicAuthEnabled === true,
      protectedPaths: (result.protectedPaths ?? []).filter(
        (p): p is string => typeof p === "string",
      ),
    };
  });
}

export function getRedirects(): Promise<RedirectRule[] | null> {
  return cached("redirects", async () => {
    const rules = await proxyClient.fetch(REDIRECTS_QUERY);
    const resolved: RedirectRule[] = [];
    for (const rule of rules ?? []) {
      const target = resolveLink(rule.to);
      if (!rule.from || !target) continue;
      resolved.push({
        from: rule.from,
        to: target.href,
        permanent: rule.permanent !== false,
      });
    }
    return resolved;
  });
}

/** Every routed path (published). `null` when unknown. */
export function getInventoryPaths(): Promise<Set<string> | null> {
  return cached("inventory", async () => {
    const paths = await proxyClient.fetch(ROUTED_PATHS_QUERY);
    return new Set(
      (paths ?? []).filter((p): p is string => typeof p === "string"),
    );
  });
}
