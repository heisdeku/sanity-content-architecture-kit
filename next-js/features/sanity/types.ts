/**
 * Frontend-facing types derived from the generated query results, so section
 * components type against what the fragments actually project.
 */
import type {
  ARTICLE_BY_SLUG_QUERY_RESULT,
  ARTICLES_QUERY_RESULT,
  HOMEPAGE_QUERY_RESULT,
  LEGAL_BY_SLUG_QUERY_RESULT,
  PAGE_BY_URI_QUERY_RESULT,
  SITE_QUERY_RESULT,
} from "@/sanity/sanity.types";

/**
 * SITE_QUERY filters by `_id` only, so typegen unions every document type.
 * Widen the union into one shape keyed by the common properties; `name`,
 * `tagline` and `defaultLocale` are pinned to strings (other members type
 * them as slugs). `getSite` casts through this type.
 */
type SiteUnion = NonNullable<SITE_QUERY_RESULT>;
type Widen<T> = { [K in keyof T]: T[K] };
export type Site = Omit<
  Widen<SiteUnion>,
  "name" | "tagline" | "defaultLocale"
> & {
  name: string | null;
  tagline: string | null;
  defaultLocale: string | null;
};
export type Homepage = NonNullable<HOMEPAGE_QUERY_RESULT>;
export type Page = NonNullable<PAGE_BY_URI_QUERY_RESULT>;
export type Article = NonNullable<ARTICLE_BY_SLUG_QUERY_RESULT>;
export type LegalPage = NonNullable<LEGAL_BY_SLUG_QUERY_RESULT>;
export type ArticleCard = ARTICLES_QUERY_RESULT[number];

export type PageBuilder = NonNullable<Homepage["pageBuilder"]>;
export type Section = PageBuilder[number];
export type SectionType = Section["_type"];
export type SectionOf<T extends SectionType> = Extract<Section, { _type: T }>;

export type HeroSection = SectionOf<"sectionHero">;
export type RichTextSection = SectionOf<"sectionRichText">;
export type ImageTextSection = SectionOf<"sectionImageText">;
export type CtaSection = SectionOf<"sectionCta">;
export type LogoGridSection = SectionOf<"sectionLogoGrid">;
export type FaqSection = SectionOf<"sectionFaq">;
export type ContactFormSection = SectionOf<"sectionContactForm">;
export type ArticleListSection = SectionOf<"sectionArticleList">;
export type MediaSection = SectionOf<"sectionMedia">;

export type Heading = NonNullable<HeroSection["heading"]>;
export type Button = NonNullable<HeroSection["buttons"]>[number];
export type Media = NonNullable<HeroSection["media"]>;
export type RichTextValue = NonNullable<HeroSection["description"]>;
export type NavigationItem = NonNullable<
  Site["navigation"]["headerItems"]
>[number];
