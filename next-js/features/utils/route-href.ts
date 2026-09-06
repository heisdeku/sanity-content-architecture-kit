import type { Route } from "next";

/**
 * `typedRoutes` is on, so `next/link` wants a known route literal. CMS-driven
 * hrefs are strings resolved at request time; this is the single, deliberate
 * cast point for them.
 */
export function asRoute(href: string): Route {
  return href as Route;
}
