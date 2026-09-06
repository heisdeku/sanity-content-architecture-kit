import type { APIRoute } from 'astro';
import { env } from '@/env';
import { buildRobotsTxt } from '@/features/site/robots';

export const GET: APIRoute = ({ cache }) => {
  cache.set({ tags: ['type:site'], maxAge: 3600, swr: 86400 });
  return new Response(buildRobotsTxt({ baseUrl: env.PUBLIC_URL }), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
