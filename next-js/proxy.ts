import { type NextRequest, NextResponse } from "next/server";
import { env } from "@/env";
import { acceptsMarkdown } from "@/features/agents/accepts-markdown";
import { isAuthorized, unauthorizedResponse } from "@/features/site/basic-auth";
import {
  getInventoryPaths,
  getRedirects,
  getSecurity,
} from "@/features/site/proxy-lookups";

/**
 * Next 16 proxy (the renamed middleware). Order, per docs/architecture.md §6:
 *   1. pass-through for assets, /studio, /api (except the internal markdown route)
 *   2. basic auth (site-wide toggle or per-document, credentials from env)
 *   3. CMS redirects
 *   4. markdown negotiation (rewrite to /api/agents/markdown)
 *   5. real 404s for paths outside the routed inventory
 *
 * `env` is imported rather than reading process.env: the proxy runs on the
 * Node runtime in Next 16, so @t3-oss/env-nextjs works here unchanged.
 */

/** Header the proxy sets on the markdown rewrite; the route refuses requests without it. */
export const AGENT_MARKDOWN_HEADER = "x-agent-markdown";
/** The requested path, carried on the rewritten request (query strings do not survive the rewrite). */
export const AGENT_MARKDOWN_PATH_HEADER = "x-agent-markdown-path";

const ALWAYS_ROUTED = new Set([
  "/",
  "/articles",
  "/llms.txt",
  "/openapi.json",
  "/robots.txt",
  "/sitemap.xml",
  "/feed.xml",
  "/og",
]);

const MARKDOWN_EXCLUDED_PREFIXES = [
  "/llms.txt",
  "/openapi.json",
  "/robots.txt",
  "/sitemap.xml",
  "/feed.xml",
  "/og",
];

let warnedFailOpen = false;

function normalisePath(pathname: string) {
  return pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
}

function isKnownRoute(path: string, inventory: Set<string>) {
  if (ALWAYS_ROUTED.has(path)) return true;
  if (inventory.has(path)) return true;
  return false;
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const path = normalisePath(pathname);

  // 1. Pass-through. The internal markdown route is never reachable directly.
  if (
    path.startsWith("/api/agents/markdown") &&
    !path.startsWith("/api/agents/markdown/generate")
  ) {
    return NextResponse.json(
      {
        error: "Not found",
        code: "not_found",
        hint: "Request a page with Accept: text/markdown instead.",
      },
      { status: 404 },
    );
  }
  if (
    path.startsWith("/api/") ||
    path.startsWith("/studio") ||
    path.startsWith("/_next")
  ) {
    return NextResponse.next();
  }

  // 2. Basic auth.
  const user = env.BASIC_AUTH_USER;
  const password = env.BASIC_AUTH_PASSWORD;
  if (user && password) {
    const security = await getSecurity();
    if (security === null) {
      if (!warnedFailOpen) {
        warnedFailOpen = true;
        console.warn(
          "[proxy] Basic auth credentials are set but the site security state could not be read. Failing open.",
        );
      }
    } else if (
      security.basicAuthEnabled ||
      security.protectedPaths.includes(path)
    ) {
      if (
        !isAuthorized(request.headers.get("authorization"), { user, password })
      ) {
        return unauthorizedResponse();
      }
    }
  }

  // 3. Redirects.
  const redirects = await getRedirects();
  const redirect = redirects?.find((rule) => rule.from === path);
  if (redirect) {
    const target = /^https?:\/\//.test(redirect.to)
      ? redirect.to
      : new URL(redirect.to, request.nextUrl.origin);
    return NextResponse.redirect(target, redirect.permanent ? 308 : 307);
  }

  // 4. Markdown negotiation.
  const wantsMarkdown =
    !MARKDOWN_EXCLUDED_PREFIXES.some((prefix) => path.startsWith(prefix)) &&
    acceptsMarkdown(request.headers.get("accept"));
  if (wantsMarkdown) {
    const url = request.nextUrl.clone();
    url.pathname = "/api/agents/markdown";
    url.search = "";
    url.searchParams.set("path", path);
    const headers = new Headers(request.headers);
    headers.set(AGENT_MARKDOWN_HEADER, "1");
    headers.set(AGENT_MARKDOWN_PATH_HEADER, path);
    return NextResponse.rewrite(url, { request: { headers } });
  }

  // 5. Real 404s. Only when the inventory is known; otherwise let the route decide.
  const inventory = await getInventoryPaths();
  if (inventory && !isKnownRoute(path, inventory)) {
    const url = request.nextUrl.clone();
    url.pathname = "/not-found";
    url.search = search;
    // Rewriting to a path that does not exist makes Next render app/not-found.tsx with a 404 status.
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip static assets and Next internals. Everything else, including the
    // text/xml/json metadata routes, goes through the proxy.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|avif|ico|css|js|map|woff2?|ttf|otf)$).*)",
  ],
};
