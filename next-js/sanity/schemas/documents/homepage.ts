import { House as HomeIcon } from "lucide-react";
import { defineField, defineType } from "sanity";
import { DOCUMENT_TYPES } from "../../config/constants";
import { createAgentsFields } from "../fields/create-agents-fields";
import { createPageBuilderField } from "../fields/create-page-builder-field";
import { createSecurityFields } from "../fields/create-security-fields";
import { createSeoField } from "../fields/create-seo-field";

/**
 * The homepage is a singleton (id `homepage`, see the singleton plugin). It is
 * page-shaped, without a `uri`: the route is `/` by definition.
 */
export const homepage = defineType({
  name: DOCUMENT_TYPES.homepage,
  title: "Homepage",
  type: "document",
  icon: HomeIcon,
  groups: [
    { name: "page", title: "Page", default: true },
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
      group: "page",
      description: "Internal name and default SEO title",
      validation: (rule) => rule.required().max(120),
    }),
    createPageBuilderField({ group: "content" }),
    createSeoField({ group: "seo" }),
    ...createAgentsFields({ group: "agents" }),
    ...createSecurityFields({ group: "security" }),
  ],
  preview: {
    select: { title: "title" },
    prepare({ title }) {
      return { title: title || "Homepage", subtitle: "/" };
    },
  },
});
