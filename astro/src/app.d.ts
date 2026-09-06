// Named app.d.ts on purpose: a src/env.d.ts next to src/env.ts is treated by
// TypeScript as the declaration output of env.ts and silently dropped.
/// <reference types="astro/client" />
/// <reference types="@sanity/astro/module" />

declare namespace App {
  interface Locals {
    /** True when the request carries a valid draft-mode cookie. */
    draft: boolean;
    /** True when the request passed Basic Auth (site-wide or per document). */
    protectedByBasicAuth: boolean;
    /** Set by the middleware when it rewrites to /api/agents/markdown. */
    markdownRewrite?: { path: string };
  }
}
