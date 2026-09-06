import { Sparkles as LottieIcon } from "lucide-react";
import { defineField, defineType } from "sanity";
import { GenerateMediaDimensionsInput } from "../../components/generate-media-dimensions-input";

/**
 * Lottie animation. The browser cannot size a canvas before parsing the
 * file, so the editor stores the intrinsic width and height (or presses
 * "Generate" to read them from the file) and the frontend reserves the box.
 */
export const appLottie = defineType({
  name: "appLottie",
  title: "Lottie animation",
  type: "object",
  icon: LottieIcon,
  components: { input: GenerateMediaDimensionsInput },
  fields: [
    defineField({
      name: "file",
      title: "File",
      type: "file",
      description: "Lottie .json or .lottie file",
      options: { accept: ".json,.lottie,application/json" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "width",
      title: "Width",
      type: "number",
      description: "Intrinsic width in pixels",
      validation: (rule) => rule.required().integer().positive(),
    }),
    defineField({
      name: "height",
      title: "Height",
      type: "number",
      description: "Intrinsic height in pixels",
      validation: (rule) => rule.required().integer().positive(),
    }),
    defineField({
      name: "autoplay",
      title: "Autoplay",
      type: "boolean",
      description: "Start playing when visible",
      initialValue: true,
    }),
    defineField({
      name: "loop",
      title: "Loop",
      type: "boolean",
      description: "Restart when the animation ends",
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      filename: "file.asset.originalFilename",
      width: "width",
      height: "height",
    },
    prepare({ filename, width, height }) {
      return {
        title: filename || "Lottie animation",
        subtitle:
          width && height ? `${width} x ${height}` : "Dimensions missing",
      };
    },
  },
});
