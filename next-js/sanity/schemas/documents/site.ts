import { Settings as SiteIcon } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";
import { DOCUMENT_TYPES } from "../../config/constants";
import { createAgentsFields } from "../fields/create-agents-fields";
import { createLinkField } from "../fields/create-link-field";
import { createMediaField } from "../fields/create-media-field";
import { createRichTextField } from "../fields/create-rich-text-field";
import { createSecurityFields } from "../fields/create-security-fields";
import { createSeoField } from "../fields/create-seo-field";

const SOCIAL_PLATFORMS = [
  "x",
  "linkedin",
  "instagram",
  "github",
  "youtube",
  "tiktok",
  "facebook",
  "bluesky",
  "threads",
  "other",
] as const;

/**
 * Global configuration singleton (id `site`). If a decision affects the whole
 * site it lives here: identity, navigation, SEO defaults, redirects,
 * security, agents, the 404 page and form notifications.
 */
export const site = defineType({
  name: DOCUMENT_TYPES.site,
  title: "Site",
  type: "document",
  icon: SiteIcon,
  groups: [
    { name: "general", title: "General", default: true },
    { name: "navigation", title: "Navigation" },
    { name: "seo", title: "SEO" },
    { name: "redirects", title: "Redirects" },
    { name: "security", title: "Security" },
    { name: "agents", title: "Agents" },
    { name: "notFound", title: "Not found" },
    { name: "notifications", title: "Notifications" },
  ],
  fields: [
    // General
    defineField({
      name: "name",
      title: "Site name",
      type: "string",
      group: "general",
      description: "Used in titles, the header and structured data",
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: "tagline",
      title: "Tagline",
      type: "string",
      group: "general",
      description: "One line describing the site",
      validation: (rule) => rule.max(160),
    }),
    createMediaField({
      name: "logo",
      title: "Logo",
      group: "general",
      allowed: ["image"],
    }),
    defineField({
      name: "defaultLocale",
      title: "Default locale",
      type: "string",
      group: "general",
      description: "BCP 47 tag, e.g. en or en-GB",
      initialValue: "en",
      validation: (rule) =>
        rule
          .required()
          .regex(/^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/, { name: "locale tag" }),
    }),

    // Navigation
    defineField({
      name: "headerItems",
      title: "Header menu",
      type: "array",
      group: "navigation",
      description: "Top level links in the header",
      of: [defineArrayMember({ type: "navigationItem" })],
      validation: (rule) => rule.max(8),
    }),
    defineField({
      name: "footerColumns",
      title: "Footer columns",
      type: "array",
      group: "navigation",
      description: "Groups of links in the footer",
      of: [
        defineArrayMember({
          name: "footerColumn",
          title: "Footer column",
          type: "object",
          fields: [
            defineField({
              name: "title",
              title: "Title",
              type: "string",
              description: "Column heading",
              validation: (rule) => rule.required().max(40),
            }),
            defineField({
              name: "items",
              title: "Links",
              type: "array",
              of: [defineArrayMember({ type: "navigationItem" })],
              validation: (rule) => rule.required().min(1).max(10),
            }),
          ],
          preview: {
            select: { title: "title", items: "items" },
            prepare({ title, items }) {
              const count = Array.isArray(items) ? items.length : 0;
              return {
                title: title || "Column",
                subtitle: `${count} link${count === 1 ? "" : "s"}`,
              };
            },
          },
        }),
      ],
      validation: (rule) => rule.max(4),
    }),
    defineField({
      name: "socialLinks",
      title: "Social links",
      type: "array",
      group: "navigation",
      description: "Profiles shown in the footer",
      of: [
        defineArrayMember({
          name: "socialLink",
          title: "Social link",
          type: "object",
          fields: [
            defineField({
              name: "platform",
              title: "Platform",
              type: "string",
              description: "Which network this profile is on",
              options: {
                list: SOCIAL_PLATFORMS.map((value) => ({
                  value,
                  title: value,
                })),
              },
              validation: (rule) => rule.required(),
            }),
            createLinkField({
              name: "link",
              required: true,
              noCustomText: true,
              allowed: ["external"],
            }),
          ],
          preview: {
            select: { title: "platform", subtitle: "link.href" },
          },
        }),
      ],
    }),

    // SEO
    createSeoField({ group: "seo", variant: "site" }),
    defineField({
      name: "favicons",
      title: "Favicons",
      type: "object",
      group: "seo",
      description: "Icons for browser tabs and home screens",
      fields: [
        defineField({
          name: "light",
          title: "Icon (light chrome)",
          type: "image",
          description: "SVG or PNG, square, shown on light tabs",
        }),
        defineField({
          name: "dark",
          title: "Icon (dark chrome)",
          type: "image",
          description: "Optional variant for dark browser chrome",
        }),
        defineField({
          name: "appleTouch",
          title: "Apple touch icon",
          type: "image",
          description: "PNG, 180 x 180, no transparency",
        }),
      ],
    }),

    // Redirects
    defineField({
      name: "redirects",
      title: "Redirects",
      type: "array",
      group: "redirects",
      description: "Old paths and where they go now",
      of: [defineArrayMember({ type: "redirect" })],
      validation: (rule) =>
        rule.custom((value) => {
          const froms = ((value as { from?: string }[] | undefined) ?? [])
            .map((item) => item.from)
            .filter(Boolean);
          const duplicates = froms.filter(
            (from, index) => froms.indexOf(from) !== index,
          );
          return duplicates.length
            ? `Duplicate redirect from ${duplicates[0]}`
            : true;
        }),
    }),

    // Security
    ...createSecurityFields({ group: "security", variant: "site" }),

    // Agents
    ...createAgentsFields({ group: "agents", variant: "site" }),

    // Not found
    defineField({
      name: "notFound",
      title: "Not found page",
      type: "object",
      group: "notFound",
      description: "Content of the 404 page",
      fields: [
        defineField({
          name: "title",
          title: "Title",
          type: "string",
          description: "Heading of the 404 page",
          initialValue: "Page not found",
          validation: (rule) => rule.required().max(80),
        }),
        createRichTextField({
          name: "description",
          title: "Description",
          styles: ["normal"],
          lists: false,
          allowMedia: false,
        }),
        createLinkField({
          name: "link",
          title: "Link",
          allowed: ["internal", "external"],
        }),
      ],
    }),

    // Notifications
    defineField({
      name: "notifications",
      title: "Notifications",
      type: "object",
      group: "notifications",
      description: "Where contact form submissions are sent",
      fields: [
        defineField({
          name: "recipients",
          title: "Recipients",
          type: "array",
          description: "Email addresses that receive submissions",
          of: [
            defineArrayMember({
              type: "string",
              validation: (rule) => rule.email(),
            }),
          ],
          validation: (rule) => rule.unique().max(10),
        }),
        defineField({
          name: "fromAddress",
          title: "From address",
          type: "string",
          description: "Sender shown on notification emails",
          validation: (rule) => rule.email(),
        }),
      ],
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "tagline" },
    prepare({ title, subtitle }) {
      return { title: title || "Site", subtitle };
    },
  },
});
