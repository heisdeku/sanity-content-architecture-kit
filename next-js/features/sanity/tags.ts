import { getDocumentPath } from "@/sanity/lib/document-path";

/**
 * Cache tag convention. Every fetch is tagged so /api/revalidate can bust
 * exactly what changed:
 *   type:<_type>   lists and queries over a type
 *   doc:<_id>      one document (published id, no `drafts.` prefix)
 *   path:<uri>     one routed page
 * `type:site` rides on every fetch: publishing the Site document (navigation,
 * SEO defaults, redirects) busts everything.
 */
export const SITE_TAG = "type:site";

export function typeTag(type: string) {
  return `type:${type}`;
}

export function docTag(id: string) {
  return `doc:${publishedId(id)}`;
}

export function pathTag(path: string) {
  return `path:${path}`;
}

export function publishedId(id: string) {
  return id.replace(/^drafts\./, "").replace(/^versions\.[^.]+\./, "");
}

export type DocTagsInput = {
  type: string;
  id?: string | null;
  path?: string | null;
};

/** Tags for a single routed document fetch. */
export function docTags({ type, id, path }: DocTagsInput): string[] {
  const tags = [typeTag(type)];
  if (id) tags.push(docTag(id));
  if (path) tags.push(pathTag(path));
  return tags;
}

/** Ensure `type:site` is present exactly once. */
export function withSiteTag(tags: readonly string[]): string[] {
  return Array.from(new Set([...tags, SITE_TAG]));
}

export type WebhookDocument = {
  _type: string;
  _id: string;
  uri?: string | null;
};

/**
 * Tags the revalidate webhook should bust for a changed document. The
 * webhook sends `uri` as `coalesce(uri.current, slug.current)`, so the path is
 * rebuilt through the route namespaces (articles and legal pages get their prefix).
 */
export function tagsForDocument(doc: WebhookDocument): string[] {
  const tags = [typeTag(doc._type), docTag(doc._id)];
  const path = getDocumentPath({
    _type: doc._type,
    uri: doc.uri,
    slug: doc.uri,
  });
  if (path) tags.push(pathTag(path));
  // A category rename changes article cards; a site publish changes everything.
  if (doc._type === "category") tags.push(typeTag("article"));
  return tags;
}
