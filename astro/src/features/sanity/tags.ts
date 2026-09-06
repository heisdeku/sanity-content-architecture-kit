/**
 * Cache tag convention (spec section 5). Same strings in both editions:
 *   type:<_type>   every document of a type
 *   doc:<_id>      one document (published id, no drafts. prefix)
 *   path:<uri>     the route a document is served at
 * `type:site` is added to every page fetch so a publish of the Site singleton
 * busts everything that renders the header and footer.
 */
export const SITE_TAG = 'type:site';

export function publishedId(id: string): string {
  return id.replace(/^drafts\./, '').replace(/^versions\.[^.]+\./, '');
}

export function typeTag(type: string): string {
  return `type:${type}`;
}

export function docTag(id: string): string {
  return `doc:${publishedId(id)}`;
}

export function pathTag(path: string): string {
  const normalized = path === '' ? '/' : path.startsWith('/') ? path : `/${path}`;
  return `path:${normalized}`;
}

/** Tags for a routed document: its type, its id and its path. */
export function documentTags(doc: { _type: string; _id: string }, path?: string | null): string[] {
  const tags = [typeTag(doc._type), docTag(doc._id)];
  if (path) tags.push(pathTag(path));
  return tags;
}

/** Tags derived from a webhook payload `{ _type, _id, uri? }`. */
export function tagsFromWebhook(payload: {
  _type: string;
  _id: string;
  uri?: string | null;
}): string[] {
  const tags = new Set<string>([typeTag(payload._type), docTag(payload._id)]);
  if (payload.uri) tags.add(pathTag(payload.uri));
  // Routed types change inventories (sitemap, llms.txt, article lists).
  if (payload._type !== 'site') tags.add(typeTag('inventory'));
  return [...tags];
}

export function uniqueTags(...groups: (string | string[] | undefined | null)[]): string[] {
  const set = new Set<string>();
  for (const group of groups) {
    if (!group) continue;
    for (const tag of Array.isArray(group) ? group : [group]) set.add(tag);
  }
  return [...set];
}
