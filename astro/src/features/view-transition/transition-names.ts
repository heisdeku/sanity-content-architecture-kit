/**
 * Helpers for Astro view transitions. Use them with the transition:name
 * directive so the same element on two pages morphs between them:
 *
 *   <h1 transition:name={transitionName('article-title', slug)}>
 */
export type TransitionScope = 'article-title' | 'article-cover' | 'page-title' | 'hero-media';

export function transitionName(scope: TransitionScope, key: string): string {
  const safe = key.replace(/[^a-zA-Z0-9_-]/g, '-');
  return `${scope}-${safe}`;
}
