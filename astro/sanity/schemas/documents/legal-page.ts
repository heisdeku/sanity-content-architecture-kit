import { Scale as LegalIcon } from "lucide-react";
import { defineField, defineType } from "sanity";
import { DOCUMENT_TYPES, ROUTE_NAMESPACES } from "../../config/constants";
import { createAgentsFields } from "../fields/create-agents-fields";
import { createPageBuilderField } from "../fields/create-page-builder-field";
import { createRichTextField } from "../fields/create-rich-text-field";
import { createSecurityFields } from "../fields/create-security-fields";
import { createSeoField } from "../fields/create-seo-field";
import { createSlugField } from "../fields/create-slug-field";

/**
 * Legal contract: terms, privacy, cookies. A rich text body plus a last
 * updated date, with promotional sections blacklisted from the builder.
 * Routes under `/legal/<slug>`.
 */
export const legalPage = defineType({
  name: DOCUMENT_TYPES.legalPage,
  title: "Legal page",
  type: "document",
  icon: LegalIcon,
  groups: [
    { name: "legal", title: "Legal", default: true },
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
      group: "legal",
      description: "Document name, e.g. Privacy policy",
      validation: (rule) => rule.required().max(120),
    }),
    createSlugField({
      group: "legal",
      namespace: `${ROUTE_NAMESPACES.legalPage}/`,
    }),
    defineField({
      name: "lastUpdated",
      title: "Last updated",
      type: "date",
      group: "legal",
      description: "Date shown at the top of the document",
      validation: (rule) => rule.required(),
    }),
    createRichTextField({
      name: "body",
      title: "Body",
      group: "content",
      required: true,
      allowMedia: false,
    }),
    createPageBuilderField({
      group: "content",
      blacklist: [
        "sectionHero",
        "sectionLogoGrid",
        "sectionCta",
        "sectionContactForm",
        "sectionArticleList",
      ],
    }),
    createSeoField({ group: "seo" }),
    ...createAgentsFields({ group: "agents" }),
    ...createSecurityFields({ group: "security" }),
  ],
  preview: {
    select: {
      title: "title",
      slug: "slug.current",
      lastUpdated: "lastUpdated",
    },
    prepare({ title, slug, lastUpdated }) {
      return {
        title: title || "Untitled legal page",
        subtitle: [
          slug ? `${ROUTE_NAMESPACES.legalPage}/${slug}` : null,
          lastUpdated ? `updated ${lastUpdated}` : null,
        ]
          .filter(Boolean)
          .join(" · "),
      };
    },
  },
});
