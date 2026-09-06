import { getDocumentPath } from '@studio/lib/document-path';
import { absoluteUrl } from '@/features/utils/absolute-url';

/**
 * The resolved shape of an appLink after LINK_FRAGMENT. Internal links carry
 * the referenced document, and the href is computed here, in exactly one
 * place, from the route namespaces in sanity/config/constants.
 */
export type LinkLike = {
  kind?: string | null;
  label?: string | null;
  href?: string | null;
  email?: string | null;
  phone?: string | null;
  params?: string | null;
  newTab?: boolean | null;
  download?: boolean | null;
  file?: { url?: string | null; originalFilename?: string | null } | null;
  internal?: {
    _type: string;
    title?: string | null;
    uri?: string | null;
    slug?: string | null;
  } | null;
};

export type ResolvedLink = {
  href: string;
  label: string;
  newTab: boolean;
  download: string | boolean | undefined;
  kind: string;
};

export function resolveLink(
  link: LinkLike | null | undefined,
  { base, currentPath = '/' }: { base?: string; currentPath?: string } = {},
): ResolvedLink | null {
  if (!link?.kind) return null;
  const finish = (href: string | null, fallbackLabel: string, download?: string | boolean) => {
    if (!href) return null;
    return {
      href: base ? absoluteUrl(href, base) : href,
      label: link.label?.trim() || fallbackLabel,
      newTab: Boolean(link.newTab),
      download,
      kind: link.kind as string,
    };
  };
  switch (link.kind) {
    case 'internal': {
      const path = getDocumentPath(link.internal);
      return finish(path, link.internal?.title?.trim() || 'Read more');
    }
    case 'external':
      return finish(link.href ?? null, link.href ?? '');
    case 'email':
      return link.email ? finish(`mailto:${link.email}`, link.email) : null;
    case 'phone':
      return link.phone ? finish(`tel:${link.phone.replace(/[^+0-9]/g, '')}`, link.phone) : null;
    case 'file': {
      const url = link.file?.url ?? null;
      const name = link.file?.originalFilename ?? 'Download';
      return finish(url, name, link.download === false ? undefined : name);
    }
    case 'params': {
      const params = link.params?.startsWith('?') ? link.params : `?${link.params ?? ''}`;
      return finish(`${currentPath}${params}`, link.label ?? 'Open');
    }
    default:
      return null;
  }
}
