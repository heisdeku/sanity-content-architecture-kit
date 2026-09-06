import { LayoutGrid as LogoGridIcon } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";
import { createHeadingField } from "../fields/create-heading-field";

export const sectionLogoGrid = defineType({
  name: "sectionLogoGrid",
  title: "Logo grid",
  type: "object",
  icon: LogoGridIcon,
  fields: [
    createHeadingField({ level: "h2", max: 80 }),
    defineField({
      name: "logos",
      title: "Logos",
      type: "array",
      description: "Between 3 and 12 logos",
      of: [defineArrayMember({ type: "logoItem" })],
      validation: (rule) => rule.required().min(3).max(12),
    }),
  ],
  preview: {
    select: { title: "heading.text", logos: "logos" },
    prepare({ title, logos }) {
      const count = Array.isArray(logos) ? logos.length : 0;
      return {
        title: title || "Logo grid",
        subtitle: `Logo grid · ${count} logo${count === 1 ? "" : "s"}`,
      };
    },
  },
});
