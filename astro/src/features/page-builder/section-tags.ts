import { typeTag } from '@/features/sanity/tags';
import type { PageBuilderSections } from './types';

/**
 * Extra cache tags a page needs because of the sections it renders. An
 * article list embeds article documents, so a page with one must bust when
 * any article publishes.
 */
export function sectionTags(sections: PageBuilderSections | null | undefined): string[] {
  const tags = new Set<string>();
  for (const section of sections ?? []) {
    if (section._type === 'sectionArticleList') tags.add(typeTag('article'));
  }
  return [...tags];
}
