/**
 * Every /api/* error uses this shape (spec section 7). `code` is stable and
 * machine readable, `error` is human readable, `hint` tells the caller how to
 * recover. The same shape is documented as ErrorResponse in /openapi.json.
 */
export type ApiErrorBody = { error: string; code: string; hint?: string };

const JSON_HEADERS = { 'Content-Type': 'application/json; charset=utf-8' };

export function apiError(
  status: number,
  code: string,
  error: string,
  hint?: string,
  headers: HeadersInit = {},
): Response {
  const body: ApiErrorBody = hint ? { error, code, hint } : { error, code };
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...JSON_HEADERS, 'Cache-Control': 'private, no-store', ...headers },
  });
}

export function apiJson(data: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json; charset=utf-8');
  if (!headers.has('Cache-Control')) headers.set('Cache-Control', 'private, no-store');
  return new Response(JSON.stringify(data), { ...init, headers });
}

/** Reads a JSON body, returning null when it is missing or malformed. */
export async function readJson<T = unknown>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}
