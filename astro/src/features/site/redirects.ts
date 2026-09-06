import { REDIRECTS_QUERY } from '@studio/queries/documents/site';
import { publicClient } from '@/features/sanity/client';
import { resolveLink } from '@/features/sanity/resolve-link';
import { createTtlCache } from './ttl-cache';

export type Redirect = { from: string; to: string; status: 301 | 302 };

const cache = createTtlCache<Redirect[]>(60_000);

/** CMS-managed redirects (site.redirects), cached 60 s. Empty when unreachable. */
export async function getRedirects(): Promise<Redirect[]> {
  return cache.get(async () => {
    try {
      const rows = await publicClient.fetch(REDIRECTS_QUERY);
      const redirects: Redirect[] = [];
      for (const row of rows ?? []) {
        const target = resolveLink(row.to);
        if (!row.from || !target) continue;
        redirects.push({
          from: row.from,
          to: target.href,
          status: row.permanent === false ? 302 : 301,
        });
      }
      return redirects;
    } catch (error) {
      console.warn(
        '[redirects] Sanity unreachable, skipping:',
        error instanceof Error ? error.message : error,
      );
      return [];
    }
  });
}

export async function matchRedirect(path: string): Promise<Redirect | null> {
  const redirects = await getRedirects();
  return redirects.find((redirect) => redirect.from === path) ?? null;
}

export function clearRedirectsCache(): void {
  cache.clear();
}
