/**
 * Resolves an `appLink`. The `href` is NOT computed here: the frontend
 * resolves it from `internal._type` + `internal.uri` (pages) or
 * `internal.slug` (articles, legal pages) through the route namespaces, so a
 * single resolver owns every URL.
 */
export const LINK_FRAGMENT = /* groq */ `{
  _type,
  _key,
  kind,
  label,
  newTab,
  download,
  href,
  email,
  phone,
  params,
  "file": file.asset->{ url, originalFilename, size, mimeType },
  "internal": internal->{
    _id,
    _type,
    title,
    "uri": uri.current,
    "slug": slug.current
  }
}`;
