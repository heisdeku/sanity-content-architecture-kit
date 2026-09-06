import { CornerDownRight as RedirectIcon } from "lucide-react";
import { defineField, defineType } from "sanity";
import { createLinkField } from "../fields/create-link-field";

export const redirect = defineType({
  name: "redirect",
  title: "Redirect",
  type: "object",
  icon: RedirectIcon,
  fields: [
    defineField({
      name: "from",
      title: "From",
      type: "string",
      description: "Old path, starting with /, e.g. /old-page",
      validation: (rule) =>
        rule
          .required()
          .regex(/^\/[^\s?#]*$/, { name: "path starting with /" })
          .custom((value) =>
            typeof value === "string" && value.length > 1 && value.endsWith("/")
              ? "Remove the trailing slash"
              : true,
          ),
    }),
    createLinkField({
      name: "to",
      title: "To",
      required: true,
      noCustomText: true,
      allowed: ["internal", "external"],
    }),
    defineField({
      name: "permanent",
      title: "Permanent (301)",
      type: "boolean",
      description: "On for a moved page, off for a temporary redirect",
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      from: "from",
      kind: "to.kind",
      page: "to.internal.title",
      href: "to.href",
      permanent: "permanent",
    },
    prepare({ from, kind, page, href, permanent }) {
      const target = kind === "internal" ? page : href;
      return {
        title: `${from ?? "/"} → ${target ?? "?"}`,
        subtitle: permanent === false ? "Temporary (302)" : "Permanent (301)",
      };
    },
  },
});
