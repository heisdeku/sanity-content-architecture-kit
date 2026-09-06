/**
 * Fixed-window rate limiter. In-memory by default (fine for a single
 * serverless instance and for development); swap the store for Redis or
 * Vercel KV by implementing RateLimitStore.
 */
export interface RateLimitStore {
  increment(key: string, windowMs: number): Promise<{ count: number; resetAt: number }>;
}

class MemoryStore implements RateLimitStore {
  #hits = new Map<string, { count: number; resetAt: number }>();

  async increment(key: string, windowMs: number) {
    const now = Date.now();
    const current = this.#hits.get(key);
    if (!current || current.resetAt <= now) {
      const fresh = { count: 1, resetAt: now + windowMs };
      this.#hits.set(key, fresh);
      if (this.#hits.size > 5_000) this.#prune(now);
      return fresh;
    }
    current.count += 1;
    return current;
  }

  #prune(now: number) {
    for (const [key, value] of this.#hits) if (value.resetAt <= now) this.#hits.delete(key);
  }
}

const defaultStore = new MemoryStore();

export type RateLimitOptions = { limit?: number; windowMs?: number; store?: RateLimitStore };

export async function rateLimit(
  key: string,
  { limit = 5, windowMs = 10 * 60 * 1000, store = defaultStore }: RateLimitOptions = {},
): Promise<{ allowed: boolean; remaining: number; retryAfterSeconds: number }> {
  const { count, resetAt } = await store.increment(key, windowMs);
  return {
    allowed: count <= limit,
    remaining: Math.max(0, limit - count),
    retryAfterSeconds: Math.max(1, Math.ceil((resetAt - Date.now()) / 1000)),
  };
}

export function clientKey(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
  return `contact:${ip}`;
}
