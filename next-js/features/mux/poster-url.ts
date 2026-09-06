/** Mux thumbnail URL for a playback id. Time in seconds. */
export function muxThumbnailUrl(playbackId: string, time = 0, width = 1600) {
  return `https://image.mux.com/${playbackId}/thumbnail.webp?time=${time}&width=${width}&fit_mode=preserve`;
}

/** Animated preview (GIF-like WebP) for hover posters. */
export function muxAnimatedUrl(playbackId: string, start = 0, width = 640) {
  return `https://image.mux.com/${playbackId}/animated.webp?start=${start}&width=${width}`;
}

/** HLS stream URL, used as the video link in Markdown. */
export function muxStreamUrl(playbackId: string) {
  return `https://stream.mux.com/${playbackId}.m3u8`;
}
