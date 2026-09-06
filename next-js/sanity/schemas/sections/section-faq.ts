import { CircleHelp as FaqIcon } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";
import { createHeadingField } from "../fields/create-heading-field";

export const sectionFaq = defineType({
  name: "sectionFaq",
  title: "FAQ",
  type: "object",
  icon: FaqIcon,
  fields: [
    createHeadingField({ level: "h2" }),
    defineField({
      name: "items",
      title: "Questions",
      type: "array",
      description: "Between 1 and 20 questions",
      of: [defineArrayMember({ type: "faqItem" })],
      validation: (rule) => rule.required().min(1).max(20),
    }),
  ],
  preview: {
    select: { title: "heading.text", items: "items" },
    prepare({ title, items }) {
      const count = Array.isArray(items) ? items.length : 0;
      return {
        title: title || "FAQ",
        subtitle: `FAQ · ${count} question${count === 1 ? "" : "s"}`,
      };
    },
  },
});
