import { defineField } from "sanity";

export type SeoFieldOptions = {
  group?: string;
  /** Site defaults use a different description than document overrides. */
  variant?: "document" | "site";
};

/** SEO primitive. Same `appSeo` object on every routed document and the site. */
export function createSeoField({
  group,
  variant = "document",
}: SeoFieldOptions = {}) {
  return defineField({
    name: "seo",
    title: "SEO",
    type: "appSeo",
    group,
    description:
      variant === "site"
        ? "Defaults used when a page leaves a field empty"
        : "Overrides the site defaults. Empty fields fall back",
  });
}
