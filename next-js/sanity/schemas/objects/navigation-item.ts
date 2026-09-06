import { Menu as NavigationIcon } from "lucide-react";
import { defineField, defineType } from "sanity";
import { createLinkField } from "../fields/create-link-field";

export const navigationItem = defineType({
  name: "navigationItem",
  title: "Navigation item",
  type: "object",
  icon: NavigationIcon,
  fields: [
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      description: "Text shown in the menu",
      validation: (rule) => rule.required().max(40),
    }),
    createLinkField({
      name: "link",
      required: true,
      noCustomText: true,
      allowed: ["internal", "external", "params"],
    }),
  ],
  preview: {
    select: {
      title: "label",
      kind: "link.kind",
      page: "link.internal.title",
      href: "link.href",
    },
    prepare({ title, kind, page, href }) {
      return {
        title: title || "Navigation item",
        subtitle: kind === "internal" ? page : href,
      };
    },
  },
});
