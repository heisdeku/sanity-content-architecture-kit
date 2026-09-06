import { defineArrayMember, defineField } from "sanity";
import { SECTION_TYPES, type SectionType } from "../../config/constants";

export type PageBuilderFieldOptions = {
  group?: string;
  /** Only these sections can be added. Applied before the blacklist. */
  whitelist?: readonly SectionType[];
  /** These sections cannot be added. */
  blacklist?: readonly SectionType[];
  required?: boolean;
};

/** Computes the allowed section set for a page type. Exported for the docs and tests. */
export function resolveSectionTypes({
  whitelist,
  blacklist,
}: Pick<
  PageBuilderFieldOptions,
  "whitelist" | "blacklist"
> = {}): SectionType[] {
  let types: SectionType[] = [...SECTION_TYPES];
  if (whitelist) types = types.filter((type) => whitelist.includes(type));
  if (blacklist) types = types.filter((type) => !blacklist.includes(type));
  return types;
}

/**
 * Page builder primitive: the ordered array of sections, always named
 * `pageBuilder`. The section catalogue is closed (`SECTION_TYPES`); each page
 * type scopes it with a whitelist or a blacklist so the dropdown only offers
 * what belongs on that kind of page.
 */
export function createPageBuilderField({
  group,
  whitelist,
  blacklist,
  required = false,
}: PageBuilderFieldOptions = {}) {
  const types = resolveSectionTypes({ whitelist, blacklist });
  if (types.length === 0) {
    throw new Error(
      "createPageBuilderField: whitelist/blacklist leave no section available",
    );
  }

  return defineField({
    name: "pageBuilder",
    title: "Sections",
    type: "array",
    group,
    description: "Sections render top to bottom. Drag to reorder",
    of: types.map((type) => defineArrayMember({ type })),
    options: {
      insertMenu: {
        filter: true,
        views: [{ name: "list" }],
      },
    },
    validation: (rule) => (required ? rule.required().min(1) : rule),
  });
}
