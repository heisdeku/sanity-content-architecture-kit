import { Video as VideoIcon } from "lucide-react";
import { defineField, defineType } from "sanity";

/**
 * Video hosted on Mux. The CMS never stores raw video: the Mux plugin uploads
 * the file and stores a `mux.videoAsset` reference. Playback id, dimensions
 * and duration are read from the asset document in GROQ.
 */
export const appMuxVideo = defineType({
  name: "appMuxVideo",
  title: "Video",
  type: "object",
  icon: VideoIcon,
  fields: [
    defineField({
      name: "video",
      title: "Video",
      type: "mux.video",
      description: "Upload or pick a video from the Mux library",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "Accessible name for the video",
      validation: (rule) => rule.max(120),
    }),
    defineField({
      name: "poster",
      title: "Custom poster",
      type: "appImage",
      description: "Image shown before playback. Defaults to a frame",
    }),
    defineField({
      name: "thumbnailTime",
      title: "Poster frame time",
      type: "number",
      description: "Seconds into the video for the default poster",
      initialValue: 0,
      validation: (rule) => rule.min(0),
    }),
    defineField({
      name: "animatedPoster",
      title: "Animated poster",
      type: "boolean",
      description: "Use a short animated clip instead of a still",
      initialValue: false,
    }),
    defineField({
      name: "background",
      title: "Background mode",
      type: "boolean",
      description: "Autoplay muted and loop, without controls",
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: "title",
      playbackId: "video.asset.playbackId",
      status: "video.asset.status",
    },
    prepare({ title, playbackId, status }) {
      return {
        title: title || "Video",
        subtitle: playbackId ? `Mux ${status ?? "ready"}` : "No video selected",
      };
    },
  },
});
