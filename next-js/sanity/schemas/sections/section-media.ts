import { GalleryHorizontal as MediaSectionIcon } from "lucide-react";
import { defineField, defineType } from "sanity";
import { createMediaField } from "../fields/create-media-field";

export const sectionMedia = defineType({
  name: "sectionMedia",
  title: "Media",
  type: "object",
  icon: MediaSectionIcon,
  fields: [
    createMediaField({ required: true, withCustomRatio: true }),
    defineField({
      name: "caption",
      title: "Caption",
      type: "string",
      description: "Short text shown under the media",
      validation: (rule) => rule.max(200),
    }),
  ],
  preview: {
    select: {
      caption: "caption",
      kind: "media.kind",
      alt: "media.image.alt",
      media: "media.image",
    },
    prepare({ caption, kind, alt, media }) {
      return {
        title: caption || alt || "Media",
        subtitle: `Media · ${kind ?? "image"}`,
        media,
      };
    },
  },
});
