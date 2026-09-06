import type { ReactNode } from "react";
import { ViewTransition as ReactViewTransition } from "react";

type ViewTransitionProps = {
  children: ReactNode;
  /** Shared-element name. Same name on two routes morphs between them. */
  name?: string;
  /** CSS class applied to the transition pseudo-elements for the default case. */
  className?: string;
};

/**
 * Thin wrapper over React's <ViewTransition> (exported by the React canary that
 * Next 16's App Router ships). Route navigations are transitions in Next, so
 * this animates on navigation with no extra config. Reduced motion is handled
 * in globals.css by disabling the pseudo-element animations.
 */
export function ViewTransition({
  children,
  name,
  className,
}: ViewTransitionProps) {
  return (
    <ReactViewTransition name={name} default={className}>
      {children}
    </ReactViewTransition>
  );
}
