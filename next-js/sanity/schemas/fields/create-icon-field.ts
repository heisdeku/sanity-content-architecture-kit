import { defineField } from "sanity";

export type IconFieldOptions = {
  name?: string;
  title?: string;
  group?: string;
  required?: boolean;
};

/** Icon primitive. Produces an `appIcon` object with a name from the fixed set. */
export function createIconField({
  name = "icon",
  title = "Icon",
  group,
  required = false,
}: IconFieldOptions = {}) {
  return defineField({
    name,
    title,
    type: "appIcon",
    group,
    validation: (rule) => (required ? rule.required() : rule),
  });
}
