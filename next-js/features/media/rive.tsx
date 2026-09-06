"use client";

import { useRive } from "@rive-app/react-canvas";
import { useReducedMotion } from "@/features/motion/use-reduced-motion";

type RiveProps = {
  src: string;
  stateMachine?: string | null;
  artboard?: string | null;
  autoplay?: boolean;
  className?: string;
};

/** Rive canvas. Renders inside a MediaBox so the box is reserved before load. */
export function Rive({
  src,
  stateMachine,
  artboard,
  autoplay = true,
  className,
}: RiveProps) {
  const reduced = useReducedMotion();
  const { RiveComponent } = useRive({
    src,
    stateMachines: stateMachine ?? undefined,
    artboard: artboard ?? undefined,
    autoplay: autoplay && !reduced,
  });
  return (
    <RiveComponent
      className={className}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    />
  );
}
