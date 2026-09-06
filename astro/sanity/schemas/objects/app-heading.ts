import { Heading as HeadingIcon } from "lucide-react";
import { defineField, defineType } from "sanity";
import { HEADING_LEVELS } from "../../config/constants";

/**
 * A heading carries intent past the string: the semantic level and a length
 * limit (enforced by the factory) so a heading never wraps into a paragraph.
 */
export const appHeading = defineType({
  name: "appHeading",
  title: "Heading",
  type: "object",
  icon: HeadingIcon,
  fields: [
    defineField({
      name: "text",
      title: "Text",
      type: "string",
      description: "The heading text",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "level",
      title: "Level",
      type: "string",
      description: "HTML heading level. Use one h1 per page",
      initialValue: "h2",
      options: {
        layout: "radio",
        direction: "horizontal",
        list: HEADING_LEVELS.map((value) => ({
          value,
          title: value.toUpperCase(),
        })),
      },
    }),
  ],
  preview: {
    select: { title: "text", level: "level" },
    prepare({ title, level }) {
      return {
        title: title || "Heading",
        subtitle: level ? level.toUpperCase() : undefined,
      };
    },
  },
});
