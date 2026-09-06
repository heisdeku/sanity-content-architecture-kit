import MuxPlayer from '@mux/mux-player-react';
import type { ComponentProps } from 'react';

export type MuxVideoProps = {
  playbackId: string;
  title?: string | undefined;
  poster?: string | undefined;
  aspectRatio: number;
  /** Autoplay muted loop, no controls: decorative media. */
  background?: boolean | undefined;
  className?: string | undefined;
};

type MuxStyle = ComponentProps<typeof MuxPlayer>['style'];

/**
 * React island around @mux/mux-player-react. The box is reserved by the
 * caller's aspect ratio so the page never shifts while the player loads.
 */
export function MuxVideo({
  playbackId,
  title,
  poster,
  aspectRatio,
  background = false,
  className,
}: MuxVideoProps) {
  const style = { aspectRatio: String(aspectRatio), width: '100%', display: 'block' } as MuxStyle;
  return (
    <MuxPlayer
      playbackId={playbackId}
      streamType="on-demand"
      title={title}
      poster={poster}
      autoPlay={background ? 'muted' : false}
      muted={background}
      loop={background}
      playsInline
      preload={background ? 'auto' : 'metadata'}
      nohotkeys={background}
      style={style}
      className={className}
    />
  );
}
