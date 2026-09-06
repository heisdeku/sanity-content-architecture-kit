import { Search as SeoIcon } from "lucide-react";
import { defineField, defineType } from "sanity";

/**
 * SEO metadata. The same object sits on every routed document and, as the
 * default, on the site document. Empty overrides fall back to the site
 * defaults field by field; the frontend never ships an empty tag.
 */
export const appSeo = defineType({
  name: "appSeo",
  title: "SEO",
  type: "object",
  icon: SeoIcon,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "Browser tab and search result title",
      validation: (rule) =>
        rule.max(70).warning("Titles over 70 characters get cut off"),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      description: "Search result summary, ideally under 160 characters",
      validation: (rule) =>
        rule.max(200).warning("Descriptions over 160 characters get cut off"),
    }),
    defineField({
      name: "image",
      title: "Share image",
      type: "appImage",
      description: "Social card image, cropped to 1200 x 630",
    }),
    defineField({
      name: "noIndex",
      title: "Hide from search engines",
      type: "boolean",
      description: "Also removes the page from the sitemap and llms.txt",
      initialValue: false,
    }),
  ],
});
