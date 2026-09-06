import { SITE_SECURITY_QUERY } from '@studio/queries/documents/site';
import { publicClient } from '@/features/sanity/client';
import { createTtlCache } from './ttl-cache';

export type SiteSecurity = { basicAuthEnabled: boolean; protectedPaths: string[] };

const cache = createTtlCache<SiteSecurity | null>(60_000);

/**
 * Basic Auth state for the middleware, cached 60 s in memory. Returns null
 * when Sanity is unreachable so the caller can fail open with a warning.
 */
export async function getSiteSecurity(): Promise<SiteSecurity | null> {
  return cache.get(async () => {
    try {
      const result = await publicClient.fetch(SITE_SECURITY_QUERY);
      return {
        basicAuthEnabled: Boolean(result?.basicAuthEnabled),
        protectedPaths: (result?.protectedPaths ?? []).filter(
          (p): p is string => typeof p === 'string',
        ),
      };
    } catch (error) {
      console.warn(
        '[security] Sanity unreachable, failing open:',
        error instanceof Error ? error.message : error,
      );
      return null;
    }
  });
}

export function clearSecurityCache(): void {
  cache.clear();
}
