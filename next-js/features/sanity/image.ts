import type { SanityImageSource } from "@sanity/image-url";
import { createImageUrlBuilder } from "@sanity/image-url";
import { env } from "@/env";

const builder = createImageUrlBuilder({
  projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: env.NEXT_PUBLIC_SANITY_DATASET,
});

/** Image URL builder honouring hotspot and crop. */
export function urlFor(source: SanityImageSource) {
  return builder.image(source).auto("format");
}

export type ImageLike = {
  asset?: { _id?: string | null; url?: string | null } | null;
  hotspot?: unknown;
  crop?: unknown;
} | null;

function hasAsset(
  image: ImageLike,
): image is NonNullable<ImageLike> & { asset: { _id: string } } {
  return Boolean(image?.asset?._id);
}

/** 1200 x 630 crop for Open Graph, hotspot-aware. Null when no asset. */
export function ogImageUrl(image: ImageLike): string | null {
  if (!hasAsset(image)) return null;
  return urlFor(image as SanityImageSource)
    .width(1200)
    .height(630)
    .fit("crop")
    .crop("focalpoint")
    .quality(85)
    .url();
}

/** Responsive src for next/image with a width cap. */
export function imageUrl(image: ImageLike, width: number): string | null {
  if (!hasAsset(image)) return null;
  return urlFor(image as SanityImageSource)
    .width(width)
    .fit("max")
    .url();
}

/** Plain asset URL when no transform is needed (favicons, markdown). */
export function assetUrl(image: ImageLike): string | null {
  if (!hasAsset(image)) return null;
  return urlFor(image as SanityImageSource).url();
}
