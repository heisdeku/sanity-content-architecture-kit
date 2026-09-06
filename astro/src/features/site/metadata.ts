import { ogImageUrl } from '@/features/sanity/image';
import { absoluteUrl } from '@/features/utils/absolute-url';

/**
 * Metadata builder (spec section 8). Document `seo` overrides site defaults
 * field by field; an empty override falls back instead of shipping an empty
 * tag. Shapes here are the resolved appSeo projection from SEO_FRAGMENT.
 */
export type SeoLike = {
  title?: string | null;
  description?: string | null;
  noIndex?: boolean | null;
  image?: unknown;
};

export type SiteDefaults = {
  name: string;
  tagline?: string | null;
  seo?: SeoLike | null;
};

export type PageMetadata = {
  title: string;
  description?: string | undefined;
  canonical: string;
  robots: string;
  ogImage: string;
  ogType: 'website' | 'article';
  siteName: string;
  publishedTime?: string | undefined;
  modifiedTime?: string | undefined;
};

function pick(...values: (string | null | undefined)[]): string | undefined {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) return trimmed;
  }
  return undefined;
}

export function buildMetadata({
  site,
  doc,
  path,
  baseUrl,
  ogType = 'website',
}: {
  site: SiteDefaults | null;
  doc?: {
    title?: string | null;
    seo?: SeoLike | null;
    publishedAt?: string | null;
    _updatedAt?: string | null;
  } | null;
  path: string;
  baseUrl: string;
  ogType?: 'website' | 'article';
}): PageMetadata {
  const siteName = site?.name?.trim() || 'Content Architecture Kit';
  const documentTitle = pick(doc?.seo?.title, doc?.title);
  const title = documentTitle
    ? `${documentTitle} | ${siteName}`
    : (pick(site?.seo?.title, site?.tagline ? `${siteName}: ${site.tagline}` : undefined) ??
      siteName);
  const description = pick(doc?.seo?.description, site?.seo?.description, site?.tagline);
  const noIndex = doc?.seo?.noIndex ?? site?.seo?.noIndex ?? false;
  const canonical = absoluteUrl(path, baseUrl);
  const ogImage =
    ogImageUrl(doc?.seo?.image as never) ??
    ogImageUrl(site?.seo?.image as never) ??
    absoluteUrl(`/og?path=${encodeURIComponent(path)}`, baseUrl);

  return {
    title,
    description,
    canonical,
    robots: noIndex ? 'noindex, nofollow' : 'index, follow',
    ogImage,
    ogType,
    siteName,
    publishedTime: doc?.publishedAt ?? undefined,
    modifiedTime: doc?._updatedAt ?? undefined,
  };
}
