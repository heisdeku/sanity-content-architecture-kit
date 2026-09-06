"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useReducedMotion } from "@/features/motion/use-reduced-motion";

type LottieProps = {
  src: string;
  autoplay?: boolean;
  loop?: boolean;
  className?: string;
};

/** Lottie player. Renders inside a MediaBox so the box is reserved before load. */
export function Lottie({
  src,
  autoplay = true,
  loop = true,
  className,
}: LottieProps) {
  const reduced = useReducedMotion();
  return (
    <DotLottieReact
      src={src}
      autoplay={autoplay && !reduced}
      loop={loop}
      className={className}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    />
  );
}
