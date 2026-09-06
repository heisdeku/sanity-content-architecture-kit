import type { ReactNode } from "react";

type PreviewMediaInput = {
  kind?: string;
  image?: unknown;
  playbackId?: string;
};

/**
 * Preview thumbnail for `appMedia`: the image itself for images, the Mux
 * thumbnail for videos, nothing for canvas kinds (the type icon shows).
 */
export function mediaPreviewMedia({
  kind,
  image,
  playbackId,
}: PreviewMediaInput): ReactNode {
  if (kind === "image") return image as ReactNode;
  if (kind === "video" && playbackId) {
    return (
      // biome-ignore lint/performance/noImgElement: Studio preview thumbnail, framework-agnostic (no next/image inside sanity/)
      <img
        alt=""
        src={`https://image.mux.com/${playbackId}/thumbnail.jpg?width=160&height=160&fit_mode=smartcrop`}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    );
  }
  return undefined;
}
