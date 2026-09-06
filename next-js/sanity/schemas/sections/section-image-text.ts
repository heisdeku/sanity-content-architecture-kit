import { Columns2 as ImageTextIcon } from "lucide-react";
import { defineField, defineType } from "sanity";
import { createHeadingField } from "../fields/create-heading-field";
import { createMediaField } from "../fields/create-media-field";
import { createRichTextField } from "../fields/create-rich-text-field";

export const sectionImageText = defineType({
  name: "sectionImageText",
  title: "Image and text",
  type: "object",
  icon: ImageTextIcon,
  fields: [
    createHeadingField({ required: true }),
    createRichTextField({
      name: "body",
      title: "Text",
      required: true,
      styles: ["normal", "h3", "h4"],
      allowMedia: false,
    }),
    createMediaField({ required: true }),
    defineField({
      name: "imagePosition",
      title: "Media position",
      type: "string",
      description: "Side of the text the media sits on",
      initialValue: "right",
      options: {
        layout: "radio",
        direction: "horizontal",
        list: [
          { value: "left", title: "Left" },
          { value: "right", title: "Right" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: "heading.text",
      position: "imagePosition",
      media: "media.image",
    },
    prepare({ title, position, media }) {
      return {
        title: title || "Image and text",
        subtitle: `Image and text · media ${position ?? "right"}`,
        media,
      };
    },
  },
});
