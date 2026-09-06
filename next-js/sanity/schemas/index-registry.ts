/**
 * The schema registry: an explicit, ordered list. Not a barrel of re-exports.
 * Adding a type means adding it here on purpose (sections also go into
 * `SECTION_TYPES` in `config/constants.ts`).
 */
import { article } from "./documents/article";
import { category } from "./documents/category";
import { homepage } from "./documents/homepage";
import { legalPage } from "./documents/legal-page";
import { page } from "./documents/page";
import { site } from "./documents/site";
import { submission } from "./documents/submission";
import { appButton } from "./objects/app-button";
import { appHeading } from "./objects/app-heading";
import { appIcon } from "./objects/app-icon";
import { appImage } from "./objects/app-image";
import { appLink } from "./objects/app-link";
import { appLottie } from "./objects/app-lottie";
import { appMedia } from "./objects/app-media";
import { appMuxVideo } from "./objects/app-mux-video";
import { appRichText } from "./objects/app-rich-text";
import { appRive } from "./objects/app-rive";
import { appSeo } from "./objects/app-seo";
import { faqItem } from "./objects/faq-item";
import { logoItem } from "./objects/logo-item";
import { navigationItem } from "./objects/navigation-item";
import { redirect } from "./objects/redirect";
import { sectionArticleList } from "./sections/section-article-list";
import { sectionContactForm } from "./sections/section-contact-form";
import { sectionCta } from "./sections/section-cta";
import { sectionFaq } from "./sections/section-faq";
import { sectionHero } from "./sections/section-hero";
import { sectionImageText } from "./sections/section-image-text";
import { sectionLogoGrid } from "./sections/section-logo-grid";
import { sectionMedia } from "./sections/section-media";
import { sectionRichText } from "./sections/section-rich-text";

export const schemaTypes = [
  // Primitives (factory object types)
  appLink,
  appImage,
  appMuxVideo,
  appLottie,
  appRive,
  appMedia,
  appRichText,
  appSeo,
  appHeading,
  appIcon,
  appButton,

  // Composite objects
  navigationItem,
  redirect,
  faqItem,
  logoItem,

  // Sections (closed set, mirrors SECTION_TYPES)
  sectionHero,
  sectionRichText,
  sectionImageText,
  sectionCta,
  sectionLogoGrid,
  sectionFaq,
  sectionContactForm,
  sectionArticleList,
  sectionMedia,

  // Documents
  homepage,
  page,
  article,
  category,
  legalPage,
  submission,
  site,
];
