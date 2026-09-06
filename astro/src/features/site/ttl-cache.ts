/**
 * Tiny in-memory TTL cache for the middleware's hot reads (site security,
 * redirects). Serverless instances each keep their own copy; the TTL keeps
 * them honest, the route cache tags keep pages honest.
 */
export function createTtlCache<T>(ttlMs: number) {
  let value: T | undefined;
  let expiresAt = 0;
  let inflight: Promise<T> | null = null;

  return {
    async get(load: () => Promise<T>): Promise<T> {
      const now = Date.now();
      if (value !== undefined && now < expiresAt) return value;
      if (inflight) return inflight;
      inflight = load()
        .then((result) => {
          value = result;
          expiresAt = Date.now() + ttlMs;
          return result;
        })
        .finally(() => {
          inflight = null;
        });
      return inflight;
    },
    clear() {
      value = undefined;
      expiresAt = 0;
    },
  };
}
