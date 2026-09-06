"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/features/style/cn";

type TransitionLinkProps = ComponentProps<typeof Link>;

/**
 * next/link with a stable class hook. Next runs navigations inside a React
 * transition already, so <ViewTransition> boundaries in the tree animate
 * without any extra work here. Kept as a component so projects can attach
 * `addTransitionType` calls in one place if they add directional slides.
 */
export function TransitionLink({ className, ...props }: TransitionLinkProps) {
  return <Link {...props} className={cn("transition-colors", className)} />;
}
