import { Orbit as RiveIcon } from "lucide-react";
import { defineField, defineType } from "sanity";
import { GenerateMediaDimensionsInput } from "../../components/generate-media-dimensions-input";

/**
 * Rive animation. Like Lottie, the intrinsic artboard size is stored so the
 * frontend can reserve the exact box before the runtime loads.
 */
export const appRive = defineType({
  name: "appRive",
  title: "Rive animation",
  type: "object",
  icon: RiveIcon,
  components: { input: GenerateMediaDimensionsInput },
  fields: [
    defineField({
      name: "file",
      title: "File",
      type: "file",
      description: "Rive .riv file",
      options: { accept: ".riv" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "stateMachine",
      title: "State machine",
      type: "string",
      description: "Name of the state machine to play",
      validation: (rule) => rule.max(80),
    }),
    defineField({
      name: "artboard",
      title: "Artboard",
      type: "string",
      description: "Artboard name. Leave empty for the default",
      validation: (rule) => rule.max(80),
    }),
    defineField({
      name: "width",
      title: "Width",
      type: "number",
      description: "Artboard width in pixels",
      validation: (rule) => rule.required().integer().positive(),
    }),
    defineField({
      name: "height",
      title: "Height",
      type: "number",
      description: "Artboard height in pixels",
      validation: (rule) => rule.required().integer().positive(),
    }),
    defineField({
      name: "autoplay",
      title: "Autoplay",
      type: "boolean",
      description: "Start playing when visible",
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
        title: filename || "Rive animation",
        subtitle:
          width && height ? `${width} x ${height}` : "Dimensions missing",
      };
    },
  },
});
