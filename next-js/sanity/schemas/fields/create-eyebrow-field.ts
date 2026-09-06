import { defineField } from "sanity";

export type EyebrowFieldOptions = {
  name?: string;
  title?: string;
  group?: string;
  max?: number;
};

/** Eyebrow primitive: the short label above a heading. Plain string, max 60. */
export function createEyebrowField({
  name = "eyebrow",
  title = "Eyebrow",
  group,
  max = 60,
}: EyebrowFieldOptions = {}) {
  return defineField({
    name,
    title,
    type: "string",
    group,
    description: "Short label shown above the heading",
    validation: (rule) => rule.max(max),
  });
}
