import type { Site } from "@/features/sanity/types";
import { DEFAULT_SITE_NAME } from "@/features/site/metadata";
import { absoluteUrl, siteOrigin } from "@/features/utils/absolute-url";

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD must be inlined as a script.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function WebSiteJsonLd({ site }: { site: Site | null }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: site?.name ?? DEFAULT_SITE_NAME,
        url: siteOrigin(),
        ...(site?.tagline ? { description: site.tagline } : {}),
      }}
    />
  );
}

type ArticleJsonLdProps = {
  title: string;
  path: string;
  description?: string | null;
  author?: string | null;
  publishedAt?: string | null;
  updatedAt?: string | null;
  image?: string | null;
};

export function ArticleJsonLd({
  title,
  path,
  description,
  author,
  publishedAt,
  updatedAt,
  image,
}: ArticleJsonLdProps) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: title,
        url: absoluteUrl(path),
        ...(description ? { description } : {}),
        ...(author ? { author: { "@type": "Person", name: author } } : {}),
        ...(publishedAt ? { datePublished: publishedAt } : {}),
        ...(updatedAt ? { dateModified: updatedAt } : {}),
        ...(image ? { image } : {}),
      }}
    />
  );
}
