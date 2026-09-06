/**
 * Names the whole workspace relies on. Nothing here is configurable at
 * runtime: the frontend, the queries and the Studio all import these so a
 * rename happens in exactly one place.
 */

export const DOCUMENT_TYPES = {
  homepage: "homepage",
  page: "page",
  article: "article",
  category: "category",
  legalPage: "legalPage",
  submission: "submission",
  site: "site",
} as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[keyof typeof DOCUMENT_TYPES];

/** Documents that exist exactly once, pinned to a fixed `_id`. */
export const SINGLETON_IDS = {
  homepage: "homepage",
  site: "site",
} as const;

export const SINGLETON_TYPES = [
  DOCUMENT_TYPES.homepage,
  DOCUMENT_TYPES.site,
] as const;

/** Types editors must never create from the "new document" menu. */
export const NON_CREATABLE_TYPES = [
  ...SINGLETON_TYPES,
  DOCUMENT_TYPES.submission,
] as const;

/** Documents that own a public route and therefore carry agents + security fields. */
export const ROUTED_DOCUMENT_TYPES = [
  DOCUMENT_TYPES.homepage,
  DOCUMENT_TYPES.page,
  DOCUMENT_TYPES.article,
  DOCUMENT_TYPES.legalPage,
] as const;

export type RoutedDocumentType = (typeof ROUTED_DOCUMENT_TYPES)[number];

/** Documents an internal link may point at. Same set as the routed documents. */
export const LINKABLE_DOCUMENT_TYPES = ROUTED_DOCUMENT_TYPES;

/**
 * Route namespaces. `page` stores its full path in `uri`; the others
 * contribute a slug under a fixed prefix. The frontend resolves
 * `namespace + "/" + slug` for those, and `uri` verbatim for pages.
 */
export const ROUTE_NAMESPACES = {
  homepage: "/",
  page: "",
  article: "/articles",
  legalPage: "/legal",
} as const satisfies Record<RoutedDocumentType, string>;

/** The closed section set. Adding a section means adding it here, on purpose. */
export const SECTION_TYPES = [
  "sectionHero",
  "sectionRichText",
  "sectionImageText",
  "sectionCta",
  "sectionLogoGrid",
  "sectionFaq",
  "sectionContactForm",
  "sectionArticleList",
  "sectionMedia",
] as const;

export type SectionType = (typeof SECTION_TYPES)[number];

export const LINK_KINDS = [
  "internal",
  "external",
  "email",
  "phone",
  "file",
  "params",
] as const;
export type LinkKind = (typeof LINK_KINDS)[number];

export const MEDIA_KINDS = ["image", "video", "lottie", "rive"] as const;
export type MediaKind = (typeof MEDIA_KINDS)[number];

export const BUTTON_VARIANTS = ["primary", "secondary", "ghost"] as const;
export type ButtonVariant = (typeof BUTTON_VARIANTS)[number];

export const HEADING_LEVELS = ["h1", "h2", "h3", "h4"] as const;
export type HeadingLevel = (typeof HEADING_LEVELS)[number];

/** Fixed icon set (lucide names). The frontend maps these to components. */
export const ICON_NAMES = [
  "arrow-right",
  "arrow-up-right",
  "check",
  "chevron-right",
  "download",
  "external-link",
  "file-text",
  "globe",
  "heart",
  "info",
  "mail",
  "map-pin",
  "message-circle",
  "phone",
  "play",
  "search",
  "send",
  "shield",
  "sparkles",
  "star",
  "user",
  "zap",
] as const;

export type IconName = (typeof ICON_NAMES)[number];

/** Sanity API version used by Studio-side client calls (uniqueness checks). */
export const DEFAULT_API_VERSION = "2025-02-19";
