import { Clapperboard as MediaIcon } from "lucide-react";
import { defineField, defineType } from "sanity";
import { MediaInput } from "../../components/media-input";
import { mediaPreviewMedia } from "../../components/preview-media";
import { MEDIA_KINDS, type MediaKind } from "../../config/constants";

type MediaValue = {
  kind?: MediaKind;
  image?: { asset?: { _ref?: string } };
  video?: { video?: { asset?: { _ref?: string } } };
  lottie?: {
    file?: { asset?: { _ref?: string } };
    width?: number;
    height?: number;
  };
  rive?: {
    file?: { asset?: { _ref?: string } };
    width?: number;
    height?: number;
  };
};

const KIND_TITLES: Record<MediaKind, string> = {
  image: "Image",
  video: "Video",
  lottie: "Lottie",
  rive: "Rive",
};

/** Which payload field belongs to which kind. Also used by the input component. */
export const MEDIA_KIND_FIELDS: Record<MediaKind, string> = {
  image: "image",
  video: "video",
  lottie: "lottie",
  rive: "rive",
};

const isKind = (kind: MediaKind) => (context: { parent?: unknown }) =>
  (context.parent as MediaValue | undefined)?.kind !== kind;

/**
 * One slot, four kinds. The editor picks a kind, the object reshapes, and the
 * media fragment resolves a flat shape with width, height and aspect ratio
 * for every kind so the frontend never guesses a box size.
 */
export const appMedia = defineType({
  name: "appMedia",
  title: "Media",
  type: "object",
  icon: MediaIcon,
  components: { input: MediaInput },
  fields: [
    defineField({
      name: "kind",
      title: "Type",
      type: "string",
      description: "What kind of media to show",
      initialValue: "image",
      options: {
        layout: "radio",
        direction: "horizontal",
        list: MEDIA_KINDS.map((value) => ({
          value,
          title: KIND_TITLES[value],
        })),
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "appImage",
      hidden: isKind("image"),
    }),
    defineField({
      name: "video",
      title: "Video",
      type: "appMuxVideo",
      hidden: isKind("video"),
    }),
    defineField({
      name: "lottie",
      title: "Lottie",
      type: "appLottie",
      hidden: isKind("lottie"),
    }),
    defineField({
      name: "rive",
      title: "Rive",
      type: "appRive",
      hidden: isKind("rive"),
    }),
    defineField({
      name: "customRatio",
      title: "Custom aspect ratio",
      type: "string",
      description: "Crop to this ratio, e.g. 16:9. Empty keeps the original",
      validation: (rule) =>
        rule.regex(/^[1-9][0-9]*:[1-9][0-9]*$/, { name: "ratio like 16:9" }),
    }),
  ],
  validation: (rule) =>
    rule.custom((value) => {
      const media = value as MediaValue | undefined;
      if (!media?.kind) return true;
      switch (media.kind) {
        case "image":
          return media.image?.asset?._ref ? true : "Upload or select an image";
        case "video":
          return media.video?.video?.asset?._ref
            ? true
            : "Upload or select a video";
        case "lottie":
          if (!media.lottie?.file?.asset?._ref) return "Upload a Lottie file";
          return media.lottie.width && media.lottie.height
            ? true
            : "Generate or enter the dimensions";
        case "rive":
          if (!media.rive?.file?.asset?._ref) return "Upload a Rive file";
          return media.rive.width && media.rive.height
            ? true
            : "Generate or enter the dimensions";
        default:
          return true;
      }
    }),
  preview: {
    select: {
      kind: "kind",
      image: "image",
      alt: "image.alt",
      videoTitle: "video.title",
      playbackId: "video.video.asset.playbackId",
      lottieName: "lottie.file.asset.originalFilename",
      riveName: "rive.file.asset.originalFilename",
    },
    prepare({
      kind,
      image,
      alt,
      videoTitle,
      playbackId,
      lottieName,
      riveName,
    }) {
      const title =
        kind === "image"
          ? alt || "Image"
          : kind === "video"
            ? videoTitle || "Video"
            : kind === "lottie"
              ? lottieName || "Lottie animation"
              : riveName || "Rive animation";
      return {
        title,
        subtitle: KIND_TITLES[kind as MediaKind] ?? "Media",
        media: mediaPreviewMedia({ kind, image, playbackId }),
      };
    },
  },
});
