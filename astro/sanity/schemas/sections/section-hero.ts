import { Rocket as HeroIcon } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";
import { createEyebrowField } from "../fields/create-eyebrow-field";
import { createHeadingField } from "../fields/create-heading-field";
import { createMediaField } from "../fields/create-media-field";
import { createRichTextField } from "../fields/create-rich-text-field";

export const sectionHero = defineType({
  name: "sectionHero",
  title: "Hero",
  type: "object",
  icon: HeroIcon,
  fields: [
    createEyebrowField(),
    createHeadingField({ required: true, level: "h1", max: 90 }),
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
      description: "Up to two calls to action",
      of: [defineArrayMember({ type: "appButton" })],
      validation: (rule) => rule.max(2),
    }),
    createMediaField({ withCustomRatio: true }),
  ],
  preview: {
    select: { title: "heading.text", eyebrow: "eyebrow", media: "media.image" },
    prepare({ title, eyebrow, media }) {
      return {
        title: title || "Hero",
        subtitle: eyebrow ? `Hero · ${eyebrow}` : "Hero",
        media,
      };
    },
  },
});
