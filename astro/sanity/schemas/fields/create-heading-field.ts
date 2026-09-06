import { defineField } from "sanity";
import type { HeadingLevel } from "../../config/constants";

export type HeadingFieldOptions = {
  name?: string;
  title?: string;
  group?: string;
  required?: boolean;
  /** Default semantic level. */
  level?: HeadingLevel;
  /** Maximum text length. */
  max?: number;
};

/** Heading primitive. Produces an `appHeading` object with a length limit. */
export function createHeadingField({
  name = "heading",
  title = "Heading",
  group,
  required = false,
  level = "h2",
  max = 120,
}: HeadingFieldOptions = {}) {
  return defineField({
    name,
    title,
    type: "appHeading",
    group,
    description: `Keep it under ${max} characters`,
    initialValue: { level },
    validation: (rule) => {
      const rules = [
        rule.custom((value) => {
          const text = (value as { text?: string } | undefined)?.text;
          if (!text) return true;
          return text.length <= max
            ? true
            : `Headings must be ${max} characters or fewer`;
        }),
      ];
      if (required) rules.push(rule.required());
      return rules;
    },
  });
}
