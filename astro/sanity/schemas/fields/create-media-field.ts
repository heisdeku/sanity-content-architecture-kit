import { defineField } from "sanity";
import { MEDIA_KINDS, type MediaKind } from "../../config/constants";

export type MediaFieldOptions = {
  name?: string;
  title?: string;
  description?: string;
  group?: string;
  required?: boolean;
  /** Restrict the kinds an editor can pick. Defaults to every kind. */
  allowed?: readonly MediaKind[];
  /** Show the custom aspect ratio field. */
  withCustomRatio?: boolean;
};

/**
 * Media primitive. Produces an `appMedia` object with a kind toggle
 * (image, video, lottie, rive). Options are read by the `appMedia` input
 * component to hide kinds and the custom ratio field.
 */
export function createMediaField({
  name = "media",
  title = "Media",
  description,
  group,
  required = false,
  allowed = MEDIA_KINDS,
  withCustomRatio = false,
}: MediaFieldOptions = {}) {
  const allowedKinds = allowed.filter((kind) => MEDIA_KINDS.includes(kind));
  const initialKind = allowedKinds[0] ?? "image";

  return defineField({
    name,
    title,
    description,
    type: "appMedia",
    group,
    initialValue: { kind: initialKind },
    options: { allowed: allowedKinds, withCustomRatio },
    validation: (rule) => {
      const rules = [
        rule.custom((value) => {
          const kind = (value as { kind?: MediaKind } | undefined)?.kind;
          if (!kind || allowedKinds.includes(kind)) return true;
          return `Media type "${kind}" is not allowed here`;
        }),
      ];
      if (required) rules.push(rule.required());
      return rules;
    },
  });
}
