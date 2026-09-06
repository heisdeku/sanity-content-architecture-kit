// @ts-check
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import { cacheVercel } from '@astrojs/vercel/cache';
import sanity from '@sanity/astro';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, memoryCache } from 'astro/config';
import { loadEnv } from 'vite';

// astro.config.mjs runs before Astro's env layer exists, so read the same
// .env files Vite reads. src/env.ts stays the only place app code reads env.
const fileEnv = loadEnv(process.env.NODE_ENV ?? 'development', process.cwd(), '');
/** @param {string} key @param {string} fallback */
const read = (key, fallback) => process.env[key] || fileEnv[key] || fallback;

const site = read('PUBLIC_URL', 'http://localhost:4321');
const projectId = read('PUBLIC_SANITY_PROJECT_ID', 'abcd1234');
const dataset = read('PUBLIC_SANITY_DATASET', 'production');
const apiVersion = read('PUBLIC_SANITY_API_VERSION', '2025-02-19');
const studioBasePath = read('PUBLIC_SANITY_STUDIO_BASE_PATH', '/studio');
const onVercel = Boolean(process.env.VERCEL);

// https://astro.build/config
export default defineConfig({
  site,
  output: 'server',
  adapter: vercel(),
  // Astro 7 route cache: tags set with Astro.cache.set({ tags }) in routes and
  // busted with cache.invalidate({ tags }) from /api/revalidate. On Vercel the
  // provider maps to Vercel-CDN-Cache-Control + Vercel-Cache-Tag headers and
  // invalidateByTag(); elsewhere (astro preview, other hosts) an in-memory LRU.
  // In `astro dev` the cache object exists but never stores anything.
  cache: { provider: onVercel ? cacheVercel() : memoryCache({ max: 500 }) },
  integrations: [
    react(),
    sanity({
      projectId,
      dataset,
      apiVersion,
      useCdn: false,
      studioBasePath,
      stega: { studioUrl: studioBasePath },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    ssr: { noExternal: ['astro-portabletext'] },
  },
});
