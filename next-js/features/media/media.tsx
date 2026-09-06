import { resolveAspectRatio } from "@/features/media/aspect-ratio";
import { Lottie } from "@/features/media/lottie";
import { MediaBox } from "@/features/media/media-box";
import { Rive } from "@/features/media/rive";
import { type ImageValue, SanityImage } from "@/features/media/sanity-image";
import { MuxVideo } from "@/features/mux/mux-video";
import { assetUrl } from "@/features/sanity/image";

/** Structural shape of a resolved `appMedia` (MEDIA_FRAGMENT). */
export type MediaValue = {
  kind?: string | null;
  alt?: string | null;
  width?: number | null;
  height?: number | null;
  aspectRatio?: number | null;
  customRatio?: string | null;
  image?: ImageValue;
  video?: {
    title?: string | null;
    playbackId?: string | null;
    thumbnailTime?: number | null;
    background?: boolean | null;
    poster?: ImageValue;
  } | null;
  lottie?: {
    url?: string | null;
    autoplay?: boolean | null;
    loop?: boolean | null;
  } | null;
  rive?: {
    url?: string | null;
    stateMachine?: string | null;
    artboard?: string | null;
    autoplay?: boolean | null;
  } | null;
} | null;

type MediaProps = {
  media: MediaValue;
  sizes?: string;
  priority?: boolean;
  className?: string;
  /** Force video into background mode regardless of the editor's toggle. */
  background?: boolean;
};

/**
 * Renders an `appMedia` by kind. The box is always reserved with the aspect
 * ratio from the data, so nothing shifts while the asset loads.
 */
export function Media({
  media,
  sizes,
  priority,
  className,
  background,
}: MediaProps) {
  if (!media?.kind) return null;
  const ratio = resolveAspectRatio(media);

  switch (media.kind) {
    case "image":
      if (!media.image?.asset?._id) return null;
      return (
        <MediaBox ratio={ratio} className={className}>
          <SanityImage
            image={media.image}
            ratio={ratio}
            sizes={sizes}
            priority={priority}
            fill
            alt={media.alt ?? undefined}
          />
        </MediaBox>
      );
    case "video": {
      const playbackId = media.video?.playbackId;
      if (!playbackId) return null;
      return (
        <MediaBox ratio={ratio} className={className}>
          <MuxVideo
            playbackId={playbackId}
            title={media.video?.title}
            poster={assetUrl(media.video?.poster ?? null)}
            thumbnailTime={media.video?.thumbnailTime}
            background={background ?? media.video?.background ?? false}
          />
        </MediaBox>
      );
    }
    case "lottie":
      if (!media.lottie?.url) return null;
      return (
        <MediaBox ratio={ratio} className={className}>
          <Lottie
            src={media.lottie.url}
            autoplay={media.lottie.autoplay ?? true}
            loop={media.lottie.loop ?? true}
          />
        </MediaBox>
      );
    case "rive":
      if (!media.rive?.url) return null;
      return (
        <MediaBox ratio={ratio} className={className}>
          <Rive
            src={media.rive.url}
            stateMachine={media.rive.stateMachine}
            artboard={media.rive.artboard}
            autoplay={media.rive.autoplay ?? true}
          />
        </MediaBox>
      );
    default:
      return null;
  }
}
