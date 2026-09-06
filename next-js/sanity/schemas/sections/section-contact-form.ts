import { Mail as ContactIcon } from "lucide-react";
import { defineField, defineType } from "sanity";
import { createHeadingField } from "../fields/create-heading-field";
import { createRichTextField } from "../fields/create-rich-text-field";

export const sectionContactForm = defineType({
  name: "sectionContactForm",
  title: "Contact form",
  type: "object",
  icon: ContactIcon,
  fields: [
    createHeadingField({ required: true }),
    createRichTextField({
      name: "description",
      title: "Description",
      styles: ["normal"],
      lists: false,
      allowMedia: false,
    }),
    defineField({
      name: "successMessage",
      title: "Success message",
      type: "text",
      rows: 2,
      description: "Shown after the form is sent",
      initialValue: "Thanks, we will get back to you shortly.",
      validation: (rule) => rule.required().max(240),
    }),
  ],
  preview: {
    select: { title: "heading.text" },
    prepare({ title }) {
      return { title: title || "Contact form", subtitle: "Contact form" };
    },
  },
});
