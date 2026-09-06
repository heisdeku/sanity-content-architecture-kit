import { defineMiddleware } from 'astro:middleware';
import { normalizePath } from '@studio/lib/document-path';
import { acceptsMarkdown } from '@/features/agents/accepts-markdown';
import { decideMarkdown } from '@/features/agents/serve-markdown';
import { isDraftMode } from '@/features/draft-mode/cookie';
import {
  checkBasicAuth,
  hasBasicAuthCredentials,
  unauthorizedResponse,
} from '@/features/site/basic-auth';
import { matchRedirect } from '@/features/site/redirects';
import { getSiteSecurity } from '@/features/site/security';
import { apiError } from '@/features/utils/api-error';

// Middleware may read import.meta.env directly instead of importing src/env.ts:
// env.ts is still the only place with validation, but the middleware runs on
// every request and must not throw at import time when validation is skipped.
const BASIC_AUTH_USER = import.meta.env.BASIC_AUTH_USER as string | undefined;
const BASIC_AUTH_PASSWORD = import.meta.env.BASIC_AUTH_PASSWORD as string | undefined;

const VARY = 'Cookie, Authorization, Accept';
const ASSET_PATTERN = /\.(?:ico|svg|png|jpe?g|webp|avif|gif|woff2?|ttf|css|js|map|webmanifest)$/i;

function isPassthrough(path: string): boolean {
  return (
    path.startsWith('/_') ||
    path.startsWith('/studio') ||
    path.startsWith('/api/') ||
    ASSET_PATTERN.test(path)
  );
}

/**
 * Order (spec section 6): pass-through, Basic Auth, redirects, Markdown
 * negotiation, then the routes decide real 404s. Every HTML response varies
 * on Cookie, Authorization and Accept so the CDN keys drafts, protected and
 * agent responses separately; protected responses are never stored.
 */
export const onRequest = defineMiddleware(async (context, next) => {
  const { request, url, locals, cookies } = context;
  const path = normalizePath(url.pathname);
  locals.draft = isDraftMode(cookies);
  locals.protectedByBasicAuth = false;

  // /api/agents/markdown is only reachable through the rewrite below.
  if (path === '/api/agents/markdown' && !locals.markdownRewrite) {
    return apiError(
      404,
      'not-found',
      'Not found',
      'Request a page with Accept: text/markdown instead.',
    );
  }
  if (isPassthrough(path)) return next();

  // 2. Basic Auth: site-wide wins, then per-document. Fails open when Sanity
  //    is unreachable or credentials are missing (with a warning).
  const security = await getSiteSecurity();
  if (security && (security.basicAuthEnabled || security.protectedPaths.includes(path))) {
    if (!hasBasicAuthCredentials(BASIC_AUTH_USER, BASIC_AUTH_PASSWORD)) {
      console.warn(
        '[basic-auth] protection is enabled but BASIC_AUTH_USER/PASSWORD are not set; failing open',
      );
    } else if (
      !checkBasicAuth(
        request.headers.get('authorization'),
        BASIC_AUTH_USER as string,
        BASIC_AUTH_PASSWORD as string,
      )
    ) {
      return unauthorizedResponse();
    } else {
      locals.protectedByBasicAuth = true;
    }
  }

  // 3. Redirects from site.redirects (exact path match).
  const redirect = await matchRedirect(path);
  if (redirect) return context.redirect(redirect.to, redirect.status);

  // 4. Markdown negotiation. Browsers never list markdown, so this costs them
  //    one character comparison. Protected pages are never served as Markdown.
  if (!locals.protectedByBasicAuth && acceptsMarkdown(request.headers.get('accept'))) {
    const decision = await decideMarkdown(path);
    if (decision.kind !== 'html') {
      locals.markdownRewrite = { path };
      return next('/api/agents/markdown');
    }
  }

  // 5. Routes return real 404s themselves (Astro.rewrite('/404')).
  const response = await next();
  if (response.headers.get('content-type')?.includes('text/html')) {
    response.headers.set('Vary', VARY);
    if (locals.protectedByBasicAuth || locals.draft) {
      response.headers.set('Cache-Control', 'private, no-store');
    }
  }
  return response;
});
