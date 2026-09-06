import { SITE_QUERY } from '@studio/queries/documents/site';
import type { SITE_QUERY_RESULT } from '@studio/sanity.types';
import type { APIContext } from 'astro';
import { trySanityFetch } from '@/features/sanity/fetch';
import { resolveLink } from '@/features/sanity/resolve-link';
import { SITE_TAG } from '@/features/sanity/tags';
import { asString } from '@/features/utils/as-string';
import { isDefined } from '@/features/utils/is-defined';
import type { SiteDefaults } from './metadata';
import { EMPTY_CHROME, type NavLink, type SiteChrome } from './navigation-model';

export type SiteData = NonNullable<SITE_QUERY_RESULT>;

/** Loads the Site singleton for a page. Null when unreachable or missing. */
export async function loadSite({ draft, cache }: { draft: boolean; cache: APIContext['cache'] }) {
  const { data, error } = await trySanityFetch({
    query: SITE_QUERY,
    tags: [SITE_TAG],
    draft,
    cache,
  });
  return { site: data ?? null, error };
}

export function toSiteDefaults(site: SiteData | null): SiteDefaults | null {
  if (!site) return null;
  return { name: asString(site.name) ?? 'Site', tagline: asString(site.tagline), seo: site.seo };
}

function toNavLink(item: { label?: string | null; link?: unknown } | null): NavLink | null {
  const resolved = resolveLink(item?.link as never);
  if (!resolved) return null;
  return {
    label: item?.label?.trim() || resolved.label,
    href: resolved.href,
    newTab: resolved.newTab,
  };
}

/** Maps the Site document to the shape the header and footer render. */
export function toSiteChrome(site: SiteData | null): SiteChrome {
  if (!site) return EMPTY_CHROME;
  const nav = site.navigation;
  return {
    name: asString(site.name) ?? EMPTY_CHROME.name,
    tagline: asString(site.tagline),
    header: (nav?.headerItems ?? []).map(toNavLink).filter(isDefined),
    footerColumns: (nav?.footerColumns ?? []).map((column) => ({
      title: column.title ?? undefined,
      links: (column.items ?? []).map(toNavLink).filter(isDefined),
    })),
    social: (nav?.socialLinks ?? [])
      .map((social) => toNavLink({ label: social.platform, link: social.link }))
      .filter(isDefined),
  };
}
