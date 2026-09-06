import { sanityClient } from 'sanity:client';
import type { SanityClient } from '@sanity/client';
import { env, isProduction } from '@/env';

/**
 * Three clients, one source of truth. `sanityClient` is configured by
 * @sanity/astro from astro.config.mjs (projectId, dataset, apiVersion,
 * stega.studioUrl). Everything else derives from it with withConfig().
 *
 * useCdn: false in production (the route cache fronts every request, so the
 * live API is only hit after an invalidation), true in development unless
 * SANITY_USE_CDN overrides it.
 */
export const useCdn = env.SANITY_USE_CDN ?? !isProduction;

/** Published content, no token. */
export const publicClient: SanityClient = sanityClient.withConfig({
  useCdn,
  perspective: 'published',
  stega: { enabled: false },
});

/** Drafts perspective with the viewer token and stega on. Never cached. */
export const previewClient: SanityClient = sanityClient.withConfig({
  useCdn: false,
  perspective: 'drafts',
  token: env.SANITY_API_VIEW_TOKEN,
  stega: { enabled: true, studioUrl: env.PUBLIC_SANITY_STUDIO_BASE_PATH },
});

/** Editor token for server-side writes (submissions, agent fields). */
export const writeClient: SanityClient = sanityClient.withConfig({
  useCdn: false,
  perspective: 'raw',
  token: env.SANITY_API_EDIT_TOKEN,
  stega: { enabled: false },
});

export const hasViewToken = Boolean(env.SANITY_API_VIEW_TOKEN);
export const hasEditToken = Boolean(env.SANITY_API_EDIT_TOKEN);
