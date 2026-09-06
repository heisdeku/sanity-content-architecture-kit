export type RatioInput = {
  customRatio?: string | null;
  aspectRatio?: number | null;
  width?: number | null;
  height?: number | null;
};

/** Numeric ratio (width / height) for a media value. Never returns 0 or NaN. */
export function resolveAspectRatio(
  media: RatioInput | null | undefined,
  fallback = 16 / 9,
): number {
  if (!media) return fallback;
  const custom = media.customRatio?.match(/^(\d+):(\d+)$/);
  if (custom) {
    const w = Number(custom[1]);
    const h = Number(custom[2]);
    if (w > 0 && h > 0) return w / h;
  }
  if (
    media.aspectRatio &&
    Number.isFinite(media.aspectRatio) &&
    media.aspectRatio > 0
  )
    return media.aspectRatio;
  if (media.width && media.height && media.height > 0)
    return media.width / media.height;
  return fallback;
}

/** CSS `aspect-ratio` value with limited precision to keep markup stable. */
export function aspectRatioStyle(ratio: number) {
  return { aspectRatio: String(Math.round(ratio * 10000) / 10000) };
}
