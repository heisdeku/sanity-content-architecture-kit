/**
 * Join a path to a base origin. Pure, so it works in .astro files, islands
 * (pass the origin as a prop) and the Markdown serializer alike.
 */
export function absoluteUrl(path: string, base: string): string {
  const origin = base.replace(/\/+$/, '');
  if (/^https?:\/\//.test(path)) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${origin}${normalized}`;
}
