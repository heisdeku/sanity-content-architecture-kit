import { Shapes as IconIcon } from "lucide-react";
import { defineField, defineType } from "sanity";
import { ICON_NAMES } from "../../config/constants";

/** A name from the fixed icon set. The frontend maps names to components. */
export const appIcon = defineType({
  name: "appIcon",
  title: "Icon",
  type: "object",
  icon: IconIcon,
  fields: [
    defineField({
      name: "name",
      title: "Icon",
      type: "string",
      description: "Pick an icon from the set",
      options: {
        list: ICON_NAMES.map((value) => ({ value, title: value })),
      },
    }),
  ],
  preview: {
    select: { title: "name" },
    prepare({ title }) {
      return { title: title || "No icon" };
    },
  },
});
