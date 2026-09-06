import type { SanityImageSource } from "@sanity/image-url";
import Image from "next/image";
import { urlFor } from "@/features/sanity/image";
import { cn } from "@/features/style/cn";

export type ImageValue = {
  alt?: string | null;
  asset?: {
    _id?: string | null;
    url?: string | null;
    lqip?: string | null;
    dimensions?: { width?: number | null; height?: number | null } | null;
  } | null;
  hotspot?: unknown;
  crop?: unknown;
  width?: number | null;
  height?: number | null;
} | null;

type SanityImageProps = {
  image: ImageValue;
  /** Crop to this ratio (width / height). Omit to keep the asset ratio. */
  ratio?: number;
  /** Rendered width cap in CSS pixels; controls the srcset ceiling. */
  maxWidth?: number;
  sizes?: string;
  priority?: boolean;
  fill?: boolean;
  className?: string;
  alt?: string;
};

const DEFAULT_SIZES = "(min-width: 1280px) 1200px, 100vw";

/** next/image over a Sanity asset with hotspot-aware crops and an LQIP placeholder. */
export function SanityImage({
  image,
  ratio,
  maxWidth = 1600,
  sizes = DEFAULT_SIZES,
  priority,
  fill,
  className,
  alt,
}: SanityImageProps) {
  if (!image?.asset?._id) return null;

  const naturalWidth = image.width ?? image.asset.dimensions?.width ?? maxWidth;
  const naturalHeight =
    image.height ??
    image.asset.dimensions?.height ??
    Math.round(maxWidth / (16 / 9));
  const width = Math.min(naturalWidth, maxWidth);
  const height = ratio
    ? Math.round(width / ratio)
    : Math.round((width / naturalWidth) * naturalHeight);

  let builder = urlFor(image as SanityImageSource).width(width);
  builder = ratio
    ? builder.height(height).fit("crop").crop("focalpoint")
    : builder.fit("max");

  const shared = {
    src: builder.url(),
    alt: alt ?? image.alt ?? "",
    sizes,
    priority,
    placeholder: image.asset.lqip ? ("blur" as const) : undefined,
    blurDataURL: image.asset.lqip ?? undefined,
    className: cn("object-cover", className),
  };

  if (fill) return <Image {...shared} fill />;
  return <Image {...shared} width={width} height={height} />;
}
