import { MessageCircleQuestion as FaqIcon } from "lucide-react";
import { defineField, defineType } from "sanity";
import {
  portableTextToPlain,
  truncate,
} from "../../lib/portable-text-to-plain";
import { createRichTextField } from "../fields/create-rich-text-field";

export const faqItem = defineType({
  name: "faqItem",
  title: "Question",
  type: "object",
  icon: FaqIcon,
  fields: [
    defineField({
      name: "question",
      title: "Question",
      type: "string",
      description: "The question as the visitor would ask it",
      validation: (rule) => rule.required().max(160),
    }),
    createRichTextField({
      name: "answer",
      title: "Answer",
      required: true,
      styles: ["normal", "h4"],
    }),
  ],
  preview: {
    select: { title: "question", answer: "answer" },
    prepare({ title, answer }) {
      return {
        title: title || "Question",
        subtitle: truncate(portableTextToPlain(answer)),
      };
    },
  },
});
