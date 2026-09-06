import type { ARTICLES_QUERY_RESULT, HOMEPAGE_QUERY_RESULT } from '@studio/sanity.types';

/**
 * Section shapes come from the generated query result types, so a renderer
 * receives exactly what PAGE_BUILDER_FRAGMENT projects. Every page-shaped
 * query uses the same fragment; the homepage result is the reference.
 */
export type PageBuilderSections = NonNullable<NonNullable<HOMEPAGE_QUERY_RESULT>['pageBuilder']>;
export type Section = PageBuilderSections[number];
export type SectionType = Section['_type'];
export type SectionOf<T extends SectionType> = Extract<Section, { _type: T }>;

export type MediaData = NonNullable<SectionOf<'sectionHero'>['media']>;
export type HeadingData = NonNullable<SectionOf<'sectionHero'>['heading']>;
export type ButtonData = NonNullable<SectionOf<'sectionHero'>['buttons']>[number];
export type RichTextValue = NonNullable<SectionOf<'sectionRichText'>['body']>;
export type ArticleCardData = ARTICLES_QUERY_RESULT[number];
