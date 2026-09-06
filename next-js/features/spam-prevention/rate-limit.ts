/**
 * Fixed-window rate limiter. In-memory by default, which is per instance on
 * serverless. Swap `store` for Redis/KV in production if you need it global.
 */
type Entry = { count: number; resetAt: number };

export type RateLimitStore = {
  get(key: string): Entry | undefined;
  set(key: string, entry: Entry): void;
};

const memory = new Map<string, Entry>();

const memoryStore: RateLimitStore = {
  get: (key) => memory.get(key),
  set: (key, entry) => {
    memory.set(key, entry);
    if (memory.size > 10_000) {
      const now = Date.now();
      for (const [k, v] of memory) if (v.resetAt < now) memory.delete(k);
    }
  },
};

export type RateLimitOptions = {
  /** Requests allowed per window. */
  limit?: number;
  /** Window length in ms. */
  windowMs?: number;
  store?: RateLimitStore;
};

export function rateLimit(key: string, options: RateLimitOptions = {}) {
  const { limit = 5, windowMs = 60_000, store = memoryStore } = options;
  const now = Date.now();
  const current = store.get(key);

  if (!current || current.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }

  if (current.count >= limit) {
    return { ok: false, remaining: 0, retryAfterMs: current.resetAt - now };
  }

  current.count += 1;
  store.set(key, current);
  return { ok: true, remaining: limit - current.count };
}

/** Best-effort client key from proxy headers. */
export function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return (
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "anonymous"
  );
}
