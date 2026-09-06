import { defineField, type SlugValidationContext } from "sanity";
import { DEFAULT_API_VERSION } from "../../config/constants";
import { toSlug } from "../../lib/document-path";

export type SlugFieldOptions = {
  group?: string;
  required?: boolean;
  source?: string;
  /** Shown in the description, e.g. "/articles/". */
  namespace?: string;
};

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

async function isUniqueSlug(
  slug: string,
  context: SlugValidationContext,
): Promise<boolean> {
  const { document, getClient } = context;
  if (!document) return true;
  const id = document._id.replace(/^drafts\./, "");
  const client = getClient({ apiVersion: DEFAULT_API_VERSION });
  const query = `!defined(*[_type == $type && !(_id in [$draft, $published]) && slug.current == $slug][0]._id)`;
  return client.fetch<boolean>(query, {
    type: document._type,
    draft: `drafts.${id}`,
    published: id,
    slug,
  });
}

/**
 * Slug primitive for documents that live under a fixed namespace
 * (articles, legal pages, categories). Editors manage the final segment
 * only; the application owns the prefix.
 */
export function createSlugField({
  group,
  required = true,
  source = "title",
  namespace,
}: SlugFieldOptions = {}) {
  return defineField({
    name: "slug",
    title: "Slug",
    type: "slug",
    group,
    description: namespace
      ? `Last part of the URL after ${namespace}`
      : "URL-safe identifier",
    options: {
      source,
      slugify: toSlug,
      isUnique: isUniqueSlug,
      maxLength: 96,
    },
    validation: (rule) => {
      const rules = [
        rule.custom((value) => {
          const current = (value as { current?: string } | undefined)?.current;
          if (!current) return true;
          return SLUG_PATTERN.test(current)
            ? true
            : "Use lowercase letters, numbers and dashes only";
        }),
      ];
      if (required) rules.push(rule.required());
      return rules;
    },
  });
}
