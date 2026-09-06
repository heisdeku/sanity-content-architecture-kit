import type { APIRoute } from 'astro';
import { buildNotFound, markdownResponse } from '@/features/agents/serve-markdown';

/** The Markdown recovery map, also reachable directly for agents that want it. */
export const GET: APIRoute = async ({ url, cache }) => {
  cache.set(false);
  const path = url.searchParams.get('path') ?? '/';
  return markdownResponse(await buildNotFound(path), { status: 404 });
};
