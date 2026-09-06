import { AlignLeft as RichTextIcon } from "lucide-react";
import { defineType } from "sanity";
import {
  portableTextToPlain,
  truncate,
} from "../../lib/portable-text-to-plain";
import { createRichTextField } from "../fields/create-rich-text-field";

export const sectionRichText = defineType({
  name: "sectionRichText",
  title: "Rich text",
  type: "object",
  icon: RichTextIcon,
  fields: [
    createRichTextField({ name: "body", title: "Text", required: true }),
  ],
  preview: {
    select: { body: "body" },
    prepare({ body }) {
      const text = portableTextToPlain(body);
      return {
        title: text ? truncate(text, 60) : "Rich text",
        subtitle: "Rich text",
      };
    },
  },
});
