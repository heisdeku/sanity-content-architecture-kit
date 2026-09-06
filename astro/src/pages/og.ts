import { readFile } from 'node:fs/promises';
import type { APIRoute } from 'astro';

/**
 * Fallback OpenGraph card. The Next edition renders one with ImageResponse;
 * here a static 1200x630 PNG (public/og-fallback.png) is served so the OG tag
 * always resolves. Documents with a seo.image never hit this route. To render
 * dynamic cards, swap the body for satori + @resvg/resvg-js output (see
 * docs/features/seo.md).
 */
let cached: BodyInit | null = null;

export const GET: APIRoute = async ({ cache }) => {
  cache.set({ tags: ['type:site'], maxAge: 86400, swr: 604800 });
  if (!cached) {
    const url = new URL('../../public/og-fallback.png', import.meta.url);
    cached = new Uint8Array(await readFile(url)) as unknown as BodyInit;
  }
  return new Response(cached, {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=86400, immutable' },
  });
};
