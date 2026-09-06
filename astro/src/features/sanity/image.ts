import { createImageUrlBuilder, type SanityImageSource } from '@sanity/image-url';
import { env } from '@/env';

const builder = createImageUrlBuilder({
  projectId: env.PUBLIC_SANITY_PROJECT_ID,
  dataset: env.PUBLIC_SANITY_DATASET,
});

export function urlFor(source: SanityImageSource) {
  return builder.image(source).auto('format');
}

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

/** 1200x630 crop, hotspot aware, for og:image and twitter:image. */
export function ogImageUrl(source: SanityImageSource | null | undefined): string | undefined {
  if (!source) return undefined;
  return urlFor(source)
    .width(OG_WIDTH)
    .height(OG_HEIGHT)
    .fit('crop')
    .format('jpg')
    .quality(85)
    .url();
}

const SRCSET_WIDTHS = [320, 480, 640, 768, 1024, 1280, 1536, 1920, 2560];

/**
 * Build src + srcset for a Sanity image. The rendered box is reserved by the
 * caller from the document's width/height so nothing shifts on load.
 */
export function imageSources(
  source: SanityImageSource,
  { maxWidth = 1920, quality = 80 }: { maxWidth?: number; quality?: number } = {},
): { src: string; srcset: string } {
  const widths: number[] = SRCSET_WIDTHS.filter((w) => w <= maxWidth);
  if (widths.length === 0 || widths[widths.length - 1] !== maxWidth) widths.push(maxWidth);
  const srcset = widths
    .map((w) => `${urlFor(source).width(w).quality(quality).url()} ${w}w`)
    .join(', ');
  return { src: urlFor(source).width(Math.min(maxWidth, 1280)).quality(quality).url(), srcset };
}
