import { Image as ImageIcon } from "lucide-react";
import { defineField, defineType } from "sanity";

/**
 * Image with hotspot and alt text. Width, height and aspect ratio are not
 * stored: the image fragment derives them from `asset->metadata.dimensions`.
 */
export const appImage = defineType({
  name: "appImage",
  title: "Image",
  type: "image",
  icon: ImageIcon,
  options: { hotspot: true },
  fields: [
    defineField({
      name: "alt",
      title: "Alternative text",
      type: "string",
      description: "Describe the image for screen readers",
      validation: (rule) => rule.max(160),
    }),
  ],
  preview: {
    select: { alt: "alt", media: "asset", filename: "asset.originalFilename" },
    prepare({ alt, media, filename }) {
      return { title: alt || filename || "Image", media };
    },
  },
});
