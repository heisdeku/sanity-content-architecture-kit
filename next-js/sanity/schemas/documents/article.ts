import { Newspaper as ArticleIcon } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";
import { DOCUMENT_TYPES, ROUTE_NAMESPACES } from "../../config/constants";
import { createAgentsFields } from "../fields/create-agents-fields";
import { createMediaField } from "../fields/create-media-field";
import { createPageBuilderField } from "../fields/create-page-builder-field";
import { createSecurityFields } from "../fields/create-security-fields";
import { createSeoField } from "../fields/create-seo-field";
import { createSlugField } from "../fields/create-slug-field";

/**
 * An article is the publishing contract: the same composition layer as a
 * page, scoped to editorial sections, plus authorship, categories and a
 * publication date. Routes under `/articles/<slug>`.
 */
export const article = defineType({
  name: DOCUMENT_TYPES.article,
  title: "Article",
  type: "document",
  icon: ArticleIcon,
  groups: [
    { name: "article", title: "Article", default: true },
    { name: "content", title: "Content" },
    { name: "seo", title: "SEO" },
    { name: "agents", title: "Agents" },
    { name: "security", title: "Security" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      group: "article",
      description: "Headline of the article",
      validation: (rule) => rule.required().max(140),
    }),
    createSlugField({
      group: "article",
      namespace: `${ROUTE_NAMESPACES.article}/`,
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 3,
      group: "article",
      description: "One or two sentences shown in lists and feeds",
      validation: (rule) => rule.required().max(300),
    }),
    createMediaField({
      name: "cover",
      title: "Cover",
      group: "article",
      allowed: ["image", "video"],
    }),
    defineField({
      name: "categories",
      title: "Categories",
      type: "array",
      group: "article",
      description: "Used for grouping and filtering",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: DOCUMENT_TYPES.category }],
        }),
      ],
      validation: (rule) => rule.unique(),
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "string",
      group: "article",
      description: "Name shown on the article",
      validation: (rule) => rule.max(80),
    }),
    defineField({
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
      group: "article",
      description: "Date shown on the article and used for ordering",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    createPageBuilderField({
      group: "content",
      whitelist: [
        "sectionRichText",
        "sectionMedia",
        "sectionImageText",
        "sectionFaq",
        "sectionCta",
      ],
    }),
    createSeoField({ group: "seo" }),
    ...createAgentsFields({ group: "agents" }),
    ...createSecurityFields({ group: "security" }),
  ],
  orderings: [
    {
      name: "publishedAtDesc",
      title: "Newest first",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
    {
      name: "titleAsc",
      title: "Title A-Z",
      by: [{ field: "title", direction: "asc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      slug: "slug.current",
      publishedAt: "publishedAt",
      media: "cover.image",
    },
    prepare({ title, slug, publishedAt, media }) {
      const date = publishedAt
        ? new Date(publishedAt).toLocaleDateString("en-GB")
        : "Unscheduled";
      return {
        title: title || "Untitled article",
        subtitle: slug ? `${date} · ${ROUTE_NAMESPACES.article}/${slug}` : date,
        media,
      };
    },
  },
});
