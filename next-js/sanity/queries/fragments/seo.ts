import { IMAGE_FRAGMENT } from "./media";

/** Projection for an `appSeo` object. Empty fields fall back to `site.seo` in code. */
export const SEO_FRAGMENT = /* groq */ `{
  title,
  description,
  noIndex,
  "image": image${IMAGE_FRAGMENT}
}`;
