import type { APIContext } from 'astro';
import { loadSite, toSiteChrome, toSiteDefaults } from './site-data';

/**
 * Everything a page route needs besides its own document: draft flag, the
 * Site singleton (tagged type:site on the response) and the derived chrome.
 */
export async function loadPageContext(context: Pick<APIContext, 'locals' | 'cache'>) {
  const draft = context.locals.draft;
  const { site, error: siteError } = await loadSite({ draft, cache: context.cache });
  return { draft, site, siteError, chrome: toSiteChrome(site), defaults: toSiteDefaults(site) };
}
