/**
 * Resolves an `appImage`. Dimensions come from the asset metadata; `asset`
 * keeps `_id` and `url` so `@sanity/image-url` can build crops with the
 * stored hotspot.
 */
export const IMAGE_FRAGMENT = /* groq */ `{
  _type,
  alt,
  hotspot,
  crop,
  "asset": asset->{
    _id,
    url,
    mimeType,
    "lqip": metadata.lqip,
    "dimensions": metadata.dimensions{ width, height, aspectRatio }
  },
  "width": asset->metadata.dimensions.width,
  "height": asset->metadata.dimensions.height,
  "aspectRatio": asset->metadata.dimensions.aspectRatio
}`;

const VIDEO_WIDTH = /* groq */ `video.video.asset->data.tracks[type == "video"][0].max_width`;
const VIDEO_HEIGHT = /* groq */ `video.video.asset->data.tracks[type == "video"][0].max_height`;

/**
 * Resolves an `appMedia` to one flat, discriminated shape. `width`, `height`
 * and `aspectRatio` are ALWAYS present for every kind (image: asset
 * metadata, video: Mux track data, lottie/rive: stored numbers) so the
 * frontend can reserve the box before the asset loads.
 */
export const MEDIA_FRAGMENT = /* groq */ `{
  _type,
  _key,
  kind,
  customRatio,
  "alt": select(
    kind == "image" => image.alt,
    kind == "video" => video.title,
    kind == "lottie" => lottie.file.asset->originalFilename,
    kind == "rive" => rive.file.asset->originalFilename
  ),
  "width": select(
    kind == "image" => image.asset->metadata.dimensions.width,
    kind == "video" => ${VIDEO_WIDTH},
    kind == "lottie" => lottie.width,
    kind == "rive" => rive.width
  ),
  "height": select(
    kind == "image" => image.asset->metadata.dimensions.height,
    kind == "video" => ${VIDEO_HEIGHT},
    kind == "lottie" => lottie.height,
    kind == "rive" => rive.height
  ),
  "aspectRatio": select(
    kind == "image" => image.asset->metadata.dimensions.aspectRatio,
    kind == "video" => ${VIDEO_WIDTH} / ${VIDEO_HEIGHT},
    kind == "lottie" => lottie.width / lottie.height,
    kind == "rive" => rive.width / rive.height
  ),
  "image": select(kind == "image" => image${IMAGE_FRAGMENT}),
  "video": select(kind == "video" => video{
    title,
    thumbnailTime,
    animatedPoster,
    background,
    "playbackId": video.asset->playbackId,
    "assetId": video.asset->assetId,
    "status": video.asset->status,
    "duration": video.asset->data.duration,
    "poster": poster${IMAGE_FRAGMENT}
  }),
  "lottie": select(kind == "lottie" => lottie{
    "url": file.asset->url,
    width,
    height,
    autoplay,
    loop
  }),
  "rive": select(kind == "rive" => rive{
    "url": file.asset->url,
    stateMachine,
    artboard,
    width,
    height,
    autoplay
  })
}`;
