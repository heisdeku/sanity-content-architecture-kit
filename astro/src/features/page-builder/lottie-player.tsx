import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useReducedMotion } from '@/features/motion/use-reduced-motion';

export function LottiePlayer({
  src,
  aspectRatio,
  loop = true,
}: {
  src: string;
  aspectRatio: number;
  loop?: boolean;
}) {
  const reduced = useReducedMotion();
  return (
    <div style={{ aspectRatio: String(aspectRatio), width: '100%' }}>
      <DotLottieReact
        src={src}
        autoplay={!reduced}
        loop={loop}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
