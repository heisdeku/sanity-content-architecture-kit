import type { ClientPerspective } from '@sanity/client';

/** 'drafts' in draft mode, 'published' otherwise. */
export function perspective(draft: boolean): ClientPerspective {
  return draft ? 'drafts' : 'published';
}
