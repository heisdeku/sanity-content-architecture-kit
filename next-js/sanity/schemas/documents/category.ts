import { Tag as CategoryIcon } from "lucide-react";
import { defineField, defineType } from "sanity";
import { DOCUMENT_TYPES } from "../../config/constants";
import { createSlugField } from "../fields/create-slug-field";

/** Taxonomy for articles. Owns no route. */
export const category = defineType({
  name: DOCUMENT_TYPES.category,
  title: "Category",
  type: "document",
  icon: CategoryIcon,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "Category name",
      validation: (rule) => rule.required().max(60),
    }),
    createSlugField(),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 2,
      description: "Short explanation of what belongs here",
      validation: (rule) => rule.max(200),
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "description" },
  },
});
