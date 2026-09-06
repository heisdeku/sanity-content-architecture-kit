import { MousePointerClick as ButtonIcon } from "lucide-react";
import { defineField, defineType } from "sanity";
import { BUTTON_VARIANTS } from "../../config/constants";
import { createIconField } from "../fields/create-icon-field";
import { createLinkField } from "../fields/create-link-field";

export const appButton = defineType({
  name: "appButton",
  title: "Button",
  type: "object",
  icon: ButtonIcon,
  fields: [
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      description: "Button text",
      validation: (rule) => rule.required().max(40),
    }),
    createLinkField({ name: "link", required: true, noCustomText: true }),
    defineField({
      name: "variant",
      title: "Style",
      type: "string",
      description: "Visual weight of the button",
      initialValue: "primary",
      options: {
        layout: "radio",
        direction: "horizontal",
        list: BUTTON_VARIANTS.map((value) => ({
          value,
          title: value.charAt(0).toUpperCase() + value.slice(1),
        })),
      },
      validation: (rule) => rule.required(),
    }),
    createIconField(),
  ],
  preview: {
    select: { title: "label", variant: "variant", kind: "link.kind" },
    prepare({ title, variant, kind }) {
      return {
        title: title || "Button",
        subtitle: [variant, kind].filter(Boolean).join(" · "),
      };
    },
  },
});
