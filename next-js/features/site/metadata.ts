import type { Metadata } from "next";
import { ogImageUrl } from "@/features/sanity/image";
import type { Site } from "@/features/sanity/types";
import { absoluteUrl } from "@/features/utils/absolute-url";

export type SeoValue = {
  title?: string | null;
  description?: string | null;
  noIndex?: boolean | null;
  image?: Parameters<typeof ogImageUrl>[0];
} | null;

export type BuildMetadataInput = {
  site: Site | null;
  seo?: SeoValue;
  /** Document title, used when `seo.title` is empty. */
  title?: string | null;
  path: string;
  type?: "website" | "article";
  publishedAt?: string | null;
};

export const DEFAULT_SITE_NAME = "Site";

/**
 * Document `seo` overrides site defaults field by field; an empty override
 * falls back. Canonical is NEXT_PUBLIC_URL + path.
 */
export function buildMetadata({
  site,
  seo,
  title,
  path,
  type = "website",
  publishedAt,
}: BuildMetadataInput): Metadata {
  const siteName = site?.name ?? DEFAULT_SITE_NAME;
  const pageTitle = seo?.title || title || siteName;
  const fullTitle =
    pageTitle === siteName ? siteName : `${pageTitle} | ${siteName}`;
  const description =
    seo?.description || site?.seo?.description || site?.tagline || undefined;
  const canonical = absoluteUrl(path);
  const image =
    ogImageUrl(seo?.image ?? null) ??
    ogImageUrl(site?.seo?.image ?? null) ??
    absoluteUrl(`/og?title=${encodeURIComponent(pageTitle)}`);
  const noIndex = seo?.noIndex === true;

  return {
    title: fullTitle,
    description,
    alternates: { canonical },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      type,
      siteName,
      title: fullTitle,
      description,
      url: canonical,
      images: [{ url: image, width: 1200, height: 630 }],
      ...(type === "article" && publishedAt
        ? { publishedTime: publishedAt }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
    },
  };
}
