import { defineType } from "sanity";
import {
  buildRichTextMembers,
  RICH_TEXT_DEFAULTS,
} from "../fields/create-rich-text-field";

/**
 * Canonical rich text: every style, every mark, lists, inline media, and
 * `appLink` link annotations. Restricted variants are built by the factory
 * from the same member builder.
 */
export const appRichText = defineType({
  name: "appRichText",
  title: "Rich text",
  type: "array",
  of: buildRichTextMembers(RICH_TEXT_DEFAULTS),
});
