import { FileText as PageIcon } from "lucide-react";
import { defineField, defineType } from "sanity";
import { DOCUMENT_TYPES } from "../../config/constants";
import { createAgentsFields } from "../fields/create-agents-fields";
import { createPageBuilderField } from "../fields/create-page-builder-field";
import { createSecurityFields } from "../fields/create-security-fields";
import { createSeoField } from "../fields/create-seo-field";
import { createUriField } from "../fields/create-uri-field";

/**
 * A page owns its route entirely: `uri` is the full public path. Identity
 * (Page), composition (Content) and discoverability (SEO) live in separate
 * tabs so they can evolve independently.
 */
export const page = defineType({
  name: DOCUMENT_TYPES.page,
  title: "Page",
  type: "document",
  icon: PageIcon,
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
      description: "Page name, also the default SEO title",
      validation: (rule) => rule.required().max(120),
    }),
    createUriField({ group: "page" }),
    createPageBuilderField({ group: "content" }),
    createSeoField({ group: "seo" }),
    ...createAgentsFields({ group: "agents" }),
    ...createSecurityFields({ group: "security" }),
  ],
  orderings: [
    {
      name: "titleAsc",
      title: "Title A-Z",
      by: [{ field: "title", direction: "asc" }],
    },
    {
      name: "uriAsc",
      title: "Path",
      by: [{ field: "uri.current", direction: "asc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      uri: "uri.current",
      protect: "security.passwordProtect",
    },
    prepare({ title, uri, protect }) {
      return {
        title: title || "Untitled page",
        subtitle: [uri, protect ? "🔒" : null].filter(Boolean).join(" "),
      };
    },
  },
});
