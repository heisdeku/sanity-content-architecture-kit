"use client";

import { motion, type Variants } from "motion/react";
import type { ReactNode } from "react";
import { useReducedMotion } from "@/features/motion/use-reduced-motion";

const variants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Render as a different element. Defaults to `div`. */
  as?: "div" | "section" | "li" | "span";
};

/** Fades and lifts children into view once. No-op under reduced motion. */
export function Reveal({
  children,
  className,
  delay = 0,
  as = "div",
}: RevealProps) {
  const reduced = useReducedMotion();
  const Component = motion[as];

  if (reduced) {
    const Plain = as;
    return <Plain className={className}>{children}</Plain>;
  }

  return (
    <Component
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </Component>
  );
}
