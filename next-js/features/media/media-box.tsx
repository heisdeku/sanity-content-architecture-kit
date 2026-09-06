import type { ReactNode } from "react";
import { aspectRatioStyle } from "@/features/media/aspect-ratio";
import { cn } from "@/features/style/cn";

type MediaBoxProps = {
  ratio: number;
  children: ReactNode;
  className?: string;
};

/** Reserves the box before the asset loads. Every media kind renders inside one. */
export function MediaBox({ ratio, children, className }: MediaBoxProps) {
  return (
    <div
      className={cn("relative w-full overflow-hidden bg-surface", className)}
      style={aspectRatioStyle(ratio)}
    >
      {children}
    </div>
  );
}
