import { Building2 as LogoIcon } from "lucide-react";
import { defineField, defineType } from "sanity";
import { createLinkField } from "../fields/create-link-field";
import { createMediaField } from "../fields/create-media-field";

export const logoItem = defineType({
  name: "logoItem",
  title: "Logo",
  type: "object",
  icon: LogoIcon,
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      description: "Company or brand name",
      validation: (rule) => rule.required().max(60),
    }),
    createMediaField({
      name: "media",
      title: "Logo",
      required: true,
      allowed: ["image"],
    }),
    createLinkField({
      name: "link",
      noCustomText: true,
      allowed: ["internal", "external"],
    }),
  ],
  preview: {
    select: { title: "name", media: "media.image", kind: "link.kind" },
    prepare({ title, media, kind }) {
      return {
        title: title || "Logo",
        subtitle: kind ? "Linked" : undefined,
        media,
      };
    },
  },
});
