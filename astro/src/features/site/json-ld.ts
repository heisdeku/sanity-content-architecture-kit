import type { PageMetadata } from './metadata';

export function websiteJsonLd(meta: PageMetadata, baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: meta.siteName,
    url: baseUrl,
  };
}

export function articleJsonLd(
  meta: PageMetadata,
  article: {
    title: string;
    author?: string | null;
    publishedAt?: string | null;
    excerpt?: string | null;
  },
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt ?? meta.description,
    image: [meta.ogImage],
    datePublished: article.publishedAt ?? undefined,
    dateModified: meta.modifiedTime ?? article.publishedAt ?? undefined,
    author: article.author ? { '@type': 'Person', name: article.author } : undefined,
    mainEntityOfPage: meta.canonical,
  };
}
