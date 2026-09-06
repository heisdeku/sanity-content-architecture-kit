import type { ReactNode } from "react";
import { cn } from "@/features/style/cn";

type SectionProps = {
  children: ReactNode;
  /** Section type, for styling hooks and debugging. */
  type: string;
  width?: "prose" | "content" | "wide";
  className?: string;
};

const WIDTHS = {
  prose: "container-prose",
  content: "container-content",
  wide: "container-x",
};

/** Vertical rhythm and container for every page-builder section. */
export function Section({
  children,
  type,
  width = "content",
  className,
}: SectionProps) {
  return (
    <section data-section={type} className={cn("section-y", className)}>
      <div className={WIDTHS[width]}>{children}</div>
    </section>
  );
}
