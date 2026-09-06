import { LINK_FRAGMENT } from "./link";
import { MEDIA_FRAGMENT } from "./media";
import { RICH_TEXT_FRAGMENT } from "./rich-text";

export const HEADING_FRAGMENT = /* groq */ `{ text, level }`;

export const BUTTON_FRAGMENT = /* groq */ `{
  _key,
  _type,
  label,
  variant,
  "icon": icon.name,
  "link": link${LINK_FRAGMENT}
}`;

/** Card shape for article listings (section + index page). */
export const ARTICLE_CARD_FRAGMENT = /* groq */ `{
  _id,
  _type,
  title,
  "slug": slug.current,
  excerpt,
  author,
  publishedAt,
  "cover": cover${MEDIA_FRAGMENT},
  "categories": categories[]->{ _id, title, "slug": slug.current }
}`;

/**
 * One projection per section. Every section resolves its primitives through
 * the shared fragments, so a section component receives exactly the shape
 * the factory promised. Plain constants (no computed strings) so typegen can
 * evaluate them statically.
 */
export const SECTION_HERO_PROJECTION = /* groq */ `{
  eyebrow,
  "heading": heading${HEADING_FRAGMENT},
  "description": description[]${RICH_TEXT_FRAGMENT},
  "buttons": buttons[]${BUTTON_FRAGMENT},
  "media": media${MEDIA_FRAGMENT}
}`;

export const SECTION_RICH_TEXT_PROJECTION = /* groq */ `{
  "body": body[]${RICH_TEXT_FRAGMENT}
}`;

export const SECTION_IMAGE_TEXT_PROJECTION = /* groq */ `{
  "heading": heading${HEADING_FRAGMENT},
  "body": body[]${RICH_TEXT_FRAGMENT},
  "media": media${MEDIA_FRAGMENT},
  imagePosition
}`;

export const SECTION_CTA_PROJECTION = /* groq */ `{
  eyebrow,
  "heading": heading${HEADING_FRAGMENT},
  "description": description[]${RICH_TEXT_FRAGMENT},
  "buttons": buttons[]${BUTTON_FRAGMENT}
}`;

export const SECTION_LOGO_GRID_PROJECTION = /* groq */ `{
  "heading": heading${HEADING_FRAGMENT},
  "logos": logos[]{
    _key,
    name,
    "media": media${MEDIA_FRAGMENT},
    "link": link${LINK_FRAGMENT}
  }
}`;

export const SECTION_FAQ_PROJECTION = /* groq */ `{
  "heading": heading${HEADING_FRAGMENT},
  "items": items[]{
    _key,
    question,
    "answer": answer[]${RICH_TEXT_FRAGMENT}
  }
}`;

export const SECTION_CONTACT_FORM_PROJECTION = /* groq */ `{
  "heading": heading${HEADING_FRAGMENT},
  "description": description[]${RICH_TEXT_FRAGMENT},
  successMessage
}`;

/** `latest` mode returns up to 12 cards; the frontend slices to `limit`. */
export const SECTION_ARTICLE_LIST_PROJECTION = /* groq */ `{
  "heading": heading${HEADING_FRAGMENT},
  mode,
  limit,
  "articles": select(
    mode == "manual" => articles[]->${ARTICLE_CARD_FRAGMENT},
    *[_type == "article" && defined(slug.current)] | order(publishedAt desc)[0...12]${ARTICLE_CARD_FRAGMENT}
  )
}`;

export const SECTION_MEDIA_PROJECTION = /* groq */ `{
  "media": media${MEDIA_FRAGMENT},
  caption
}`;

/**
 * Projection for the `pageBuilder` array. Use as `pageBuilder[]${PAGE_BUILDER_FRAGMENT}`.
 * One conditional per section type; add a line here when adding a section.
 */
export const PAGE_BUILDER_FRAGMENT = /* groq */ `{
  _type,
  _key,
  _type == "sectionHero" => ${SECTION_HERO_PROJECTION},
  _type == "sectionRichText" => ${SECTION_RICH_TEXT_PROJECTION},
  _type == "sectionImageText" => ${SECTION_IMAGE_TEXT_PROJECTION},
  _type == "sectionCta" => ${SECTION_CTA_PROJECTION},
  _type == "sectionLogoGrid" => ${SECTION_LOGO_GRID_PROJECTION},
  _type == "sectionFaq" => ${SECTION_FAQ_PROJECTION},
  _type == "sectionContactForm" => ${SECTION_CONTACT_FORM_PROJECTION},
  _type == "sectionArticleList" => ${SECTION_ARTICLE_LIST_PROJECTION},
  _type == "sectionMedia" => ${SECTION_MEDIA_PROJECTION}
}`;
