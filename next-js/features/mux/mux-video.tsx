"use client";

import MuxPlayer from "@mux/mux-player-react";
import type { CSSProperties } from "react";
import { useReducedMotion } from "@/features/motion/use-reduced-motion";
import { muxThumbnailUrl } from "@/features/mux/poster-url";

type MuxVideoProps = {
  playbackId: string;
  title?: string | null;
  poster?: string | null;
  thumbnailTime?: number | null;
  /** Background mode: autoplay, muted, loop, inline, no controls. */
  background?: boolean;
  className?: string;
};

const backgroundStyle = {
  "--controls": "none",
  "--media-object-fit": "cover",
} as CSSProperties;

/** Mux player filling its MediaBox. */
export function MuxVideo({
  playbackId,
  title,
  poster,
  thumbnailTime,
  background,
  className,
}: MuxVideoProps) {
  const reduced = useReducedMotion();
  const posterUrl = poster ?? muxThumbnailUrl(playbackId, thumbnailTime ?? 0);

  return (
    <MuxPlayer
      playbackId={playbackId}
      streamType="on-demand"
      metadata={{ video_title: title ?? undefined }}
      poster={posterUrl}
      thumbnailTime={thumbnailTime ?? undefined}
      autoPlay={background && !reduced ? "muted" : false}
      muted={background}
      loop={background}
      playsInline
      nohotkeys={background}
      preload={background ? "auto" : "metadata"}
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        ...(background ? backgroundStyle : {}),
      }}
    />
  );
}
