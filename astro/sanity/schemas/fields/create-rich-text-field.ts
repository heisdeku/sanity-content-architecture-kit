import { Link as LinkIcon } from "lucide-react";
import { defineArrayMember, defineField } from "sanity";

export const RICH_TEXT_STYLES = [
  "normal",
  "h2",
  "h3",
  "h4",
  "blockquote",
] as const;
export type RichTextStyle = (typeof RICH_TEXT_STYLES)[number];

export const RICH_TEXT_MARKS = ["strong", "em", "code"] as const;
export type RichTextMark = (typeof RICH_TEXT_MARKS)[number];

export const RICH_TEXT_LISTS = ["bullet", "number"] as const;

const STYLE_TITLES: Record<RichTextStyle, string> = {
  normal: "Normal",
  h2: "Heading 2",
  h3: "Heading 3",
  h4: "Heading 4",
  blockquote: "Quote",
};

const MARK_TITLES: Record<RichTextMark, string> = {
  strong: "Bold",
  em: "Italic",
  code: "Code",
};

export type RichTextFieldOptions = {
  name?: string;
  title?: string;
  description?: string;
  group?: string;
  required?: boolean;
  /** Allowed block styles. Defaults to every style. */
  styles?: readonly RichTextStyle[];
  /** Allowed decorators. Defaults to every decorator. */
  marks?: readonly RichTextMark[];
  /** Allow lists. Defaults to true. */
  lists?: boolean;
  /** Allow inline `appImage` blocks. */
  allowImages?: boolean;
  /** Allow inline `appMedia` blocks (image, video, lottie, rive). */
  allowMedia?: boolean;
};

type MemberOptions = Required<
  Pick<
    RichTextFieldOptions,
    "styles" | "marks" | "lists" | "allowImages" | "allowMedia"
  >
>;

export const RICH_TEXT_DEFAULTS: MemberOptions = {
  styles: RICH_TEXT_STYLES,
  marks: RICH_TEXT_MARKS,
  lists: true,
  allowImages: false,
  allowMedia: true,
};

/**
 * Builds the `of` members of a Portable Text array. Shared by the named
 * `appRichText` type (canonical configuration) and by the factory when a
 * call site restricts the set.
 */
export function buildRichTextMembers({
  styles,
  marks,
  lists,
  allowImages,
  allowMedia,
}: MemberOptions) {
  const block = defineArrayMember({
    type: "block",
    styles: styles.map((value) => ({ value, title: STYLE_TITLES[value] })),
    lists: lists
      ? RICH_TEXT_LISTS.map((value) => ({
          value,
          title: value === "bullet" ? "Bullet" : "Numbered",
        }))
      : [],
    marks: {
      decorators: marks.map((value) => ({ value, title: MARK_TITLES[value] })),
      annotations: [
        defineArrayMember({
          name: "link",
          title: "Link",
          type: "appLink",
          icon: LinkIcon,
          options: { noCustomText: true },
        }),
      ],
    },
  });
  return [
    block,
    ...(allowImages ? [defineArrayMember({ type: "appImage" })] : []),
    ...(allowMedia ? [defineArrayMember({ type: "appMedia" })] : []),
  ];
}

function isCanonical(options: MemberOptions): boolean {
  return (
    options.styles.length === RICH_TEXT_DEFAULTS.styles.length &&
    options.styles.every((style) =>
      RICH_TEXT_DEFAULTS.styles.includes(style),
    ) &&
    options.marks.length === RICH_TEXT_DEFAULTS.marks.length &&
    options.marks.every((mark) => RICH_TEXT_DEFAULTS.marks.includes(mark)) &&
    options.lists === RICH_TEXT_DEFAULTS.lists &&
    options.allowImages === RICH_TEXT_DEFAULTS.allowImages &&
    options.allowMedia === RICH_TEXT_DEFAULTS.allowMedia
  );
}

/**
 * Rich text primitive. Portable Text can represent anything, so the allowed
 * set is declared explicitly: which styles, which marks, which block types.
 * Links inside text are `appLink` annotations. When the options match the
 * canonical set the field uses the named `appRichText` type; otherwise the
 * members are inlined with the same builder so the shape is identical.
 */
export function createRichTextField({
  name = "body",
  title = "Text",
  description,
  group,
  required = false,
  styles = RICH_TEXT_DEFAULTS.styles,
  marks = RICH_TEXT_DEFAULTS.marks,
  lists = RICH_TEXT_DEFAULTS.lists,
  allowImages = RICH_TEXT_DEFAULTS.allowImages,
  allowMedia = RICH_TEXT_DEFAULTS.allowMedia,
}: RichTextFieldOptions = {}) {
  const options: MemberOptions = {
    styles,
    marks,
    lists,
    allowImages,
    allowMedia,
  };

  if (isCanonical(options)) {
    return defineField({
      name,
      title,
      description,
      type: "appRichText",
      group,
      validation: (rule) => (required ? rule.required() : rule),
    });
  }

  return defineField({
    name,
    title,
    description,
    type: "array",
    group,
    of: buildRichTextMembers(options),
    validation: (rule) => (required ? rule.required() : rule),
  });
}
