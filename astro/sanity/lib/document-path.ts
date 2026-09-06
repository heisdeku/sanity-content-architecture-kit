import { ROUTE_NAMESPACES, type RoutedDocumentType } from "../config/constants";

export type RoutedDocumentLike = {
  _type: string;
  uri?: string | null;
  slug?: string | null;
};

/**
 * Resolves the public path of a routed document from its type and its
 * `uri` (pages) or `slug` (articles, legal pages). Returns null when the
 * document cannot be routed yet (missing slug or unknown type).
 */
export function getDocumentPath(
  doc: RoutedDocumentLike | null | undefined,
): string | null {
  if (!doc) return null;
  if (!(doc._type in ROUTE_NAMESPACES)) return null;
  const type = doc._type as RoutedDocumentType;
  if (type === "homepage") return "/";
  if (type === "page") return doc.uri ? normalizePath(doc.uri) : null;
  if (!doc.slug) return null;
  return `${ROUTE_NAMESPACES[type]}/${doc.slug.replace(/^\/+/, "")}`;
}

/** Ensures a leading slash and strips a trailing one (except for the root). */
export function normalizePath(path: string): string {
  const withLeading = path.startsWith("/") ? path : `/${path}`;
  if (withLeading.length > 1 && withLeading.endsWith("/"))
    return withLeading.slice(0, -1);
  return withLeading;
}

/** A path is valid when it is `/` or `/segment(/segment)*` in lowercase kebab-case. */
export const URI_PATTERN =
  /^\/(?:[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*)?$/;

export function toUri(input: string): string {
  const segments = input
    .toLowerCase()
    .split("/")
    .map((segment) =>
      segment
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, ""),
    )
    .filter(Boolean);
  return `/${segments.join("/")}`;
}

export function toSlug(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}
