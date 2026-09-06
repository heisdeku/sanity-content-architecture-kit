/**
 * The shape the header and footer render. Sanity navigation items are mapped
 * to it in features/site/navigation.ts so the .astro chrome never touches
 * raw appLink objects.
 */
export type NavLink = { label: string; href: string; newTab?: boolean | undefined };
export type NavColumn = { title?: string | undefined; links: NavLink[] };
export type SiteChrome = {
  name: string;
  tagline?: string | undefined;
  header: NavLink[];
  footerColumns: NavColumn[];
  social: NavLink[];
};

export const EMPTY_CHROME: SiteChrome = {
  name: 'Content Architecture Kit',
  header: [],
  footerColumns: [],
  social: [],
};
