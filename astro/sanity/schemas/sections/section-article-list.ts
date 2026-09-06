import { Newspaper as ArticleListIcon } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";
import { DOCUMENT_TYPES } from "../../config/constants";
import { createHeadingField } from "../fields/create-heading-field";

type ArticleListValue = { mode?: "latest" | "manual"; articles?: unknown[] };

export const sectionArticleList = defineType({
  name: "sectionArticleList",
  title: "Article list",
  type: "object",
  icon: ArticleListIcon,
  fields: [
    createHeadingField({ level: "h2" }),
    defineField({
      name: "mode",
      title: "Selection",
      type: "string",
      description: "Latest articles or a hand-picked list",
      initialValue: "latest",
      options: {
        layout: "radio",
        direction: "horizontal",
        list: [
          { value: "latest", title: "Latest" },
          { value: "manual", title: "Manual" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "limit",
      title: "Number of articles",
      type: "number",
      description: "How many of the latest articles to show",
      initialValue: 3,
      hidden: ({ parent }) =>
        (parent as ArticleListValue | undefined)?.mode !== "latest",
      validation: (rule) => rule.integer().min(1).max(12),
    }),
    defineField({
      name: "articles",
      title: "Articles",
      type: "array",
      description: "Pick the articles to show, in order",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: DOCUMENT_TYPES.article }],
          options: { disableNew: true },
        }),
      ],
      hidden: ({ parent }) =>
        (parent as ArticleListValue | undefined)?.mode !== "manual",
      validation: (rule) =>
        rule.unique().custom((value, context) => {
          const parent = context.parent as ArticleListValue | undefined;
          if (parent?.mode !== "manual") return true;
          return Array.isArray(value) && value.length > 0
            ? true
            : "Pick at least one article";
        }),
    }),
  ],
  preview: {
    select: {
      title: "heading.text",
      mode: "mode",
      limit: "limit",
      articles: "articles",
    },
    prepare({ title, mode, limit, articles }) {
      const count =
        mode === "manual"
          ? Array.isArray(articles)
            ? articles.length
            : 0
          : (limit ?? 3);
      return {
        title: title || "Article list",
        subtitle: `Article list · ${mode === "manual" ? "manual" : "latest"} · ${count}`,
      };
    },
  },
});
