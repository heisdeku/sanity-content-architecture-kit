/** Poster and thumbnail URLs for a Mux playback id. */
export function muxPosterUrl(playbackId: string, { time = 0, width = 1600 } = {}): string {
  return `https://image.mux.com/${playbackId}/thumbnail.jpg?time=${time}&width=${width}&fit_mode=preserve`;
}

export function muxAnimatedPosterUrl(playbackId: string, { width = 640 } = {}): string {
  return `https://image.mux.com/${playbackId}/animated.gif?width=${width}`;
}

export function muxStreamUrl(playbackId: string): string {
  return `https://stream.mux.com/${playbackId}.m3u8`;
}
