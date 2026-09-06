import { ArticleList } from "@/features/page-builder/sections/article-list";
import { ContactFormBlock } from "@/features/page-builder/sections/contact-form";
import { Cta } from "@/features/page-builder/sections/cta";
import { Faq } from "@/features/page-builder/sections/faq";
import { Hero } from "@/features/page-builder/sections/hero";
import { ImageText } from "@/features/page-builder/sections/image-text";
import { LogoGrid } from "@/features/page-builder/sections/logo-grid";
import { MediaBlock } from "@/features/page-builder/sections/media";
import { RichTextBlock } from "@/features/page-builder/sections/rich-text";
// plop:page-builder-import
import type {
  PageBuilder as PageBuilderValue,
  Section,
} from "@/features/sanity/types";
import { assertNever } from "@/features/utils/assert-never";

/** Exhaustive map from `_type` to section component. TypeScript fails when a type is missing. */
function renderSection(section: Section) {
  switch (section._type) {
    case "sectionHero":
      return <Hero section={section} />;
    case "sectionRichText":
      return <RichTextBlock section={section} />;
    case "sectionImageText":
      return <ImageText section={section} />;
    case "sectionCta":
      return <Cta section={section} />;
    case "sectionLogoGrid":
      return <LogoGrid section={section} />;
    case "sectionFaq":
      return <Faq section={section} />;
    case "sectionContactForm":
      return <ContactFormBlock section={section} />;
    case "sectionArticleList":
      return <ArticleList section={section} />;
    case "sectionMedia":
      return <MediaBlock section={section} />;
    // plop:page-builder-case
    default:
      return assertNever(section, "section type");
  }
}

export function PageBuilder({
  sections,
}: {
  sections: PageBuilderValue | null | undefined;
}) {
  if (!sections?.length) return null;
  return (
    <>
      {sections.map((section) => (
        <div key={section._key}>{renderSection(section)}</div>
      ))}
    </>
  );
}
