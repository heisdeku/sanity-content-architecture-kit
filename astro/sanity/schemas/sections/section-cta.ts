import { Megaphone as CtaIcon } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";
import { createEyebrowField } from "../fields/create-eyebrow-field";
import { createHeadingField } from "../fields/create-heading-field";
import { createRichTextField } from "../fields/create-rich-text-field";

export const sectionCta = defineType({
  name: "sectionCta",
  title: "Call to action",
  type: "object",
  icon: CtaIcon,
  fields: [
    createEyebrowField(),
    createHeadingField({ required: true }),
    createRichTextField({
      name: "description",
      title: "Description",
      styles: ["normal"],
      lists: false,
      allowMedia: false,
    }),
    defineField({
      name: "buttons",
      title: "Buttons",
      type: "array",
      description: "One or two calls to action",
      of: [defineArrayMember({ type: "appButton" })],
      validation: (rule) => rule.required().min(1).max(2),
    }),
  ],
  preview: {
    select: { title: "heading.text", first: "buttons.0.label" },
    prepare({ title, first }) {
      return {
        title: title || "Call to action",
        subtitle: first ? `Call to action · ${first}` : "Call to action",
      };
    },
  },
});
