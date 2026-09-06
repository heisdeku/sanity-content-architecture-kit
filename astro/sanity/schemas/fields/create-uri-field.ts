import { defineField, type SlugValidationContext } from "sanity";
import { UriInput } from "../../components/uri-input";
import { DEFAULT_API_VERSION } from "../../config/constants";
import { normalizePath, toUri, URI_PATTERN } from "../../lib/document-path";

export type UriFieldOptions = {
  group?: string;
  required?: boolean;
  /** Field the initial value is generated from. */
  source?: string;
};

async function isUniqueUri(
  uri: string,
  context: SlugValidationContext,
): Promise<boolean> {
  const { document, getClient } = context;
  if (!document) return true;
  const id = document._id.replace(/^drafts\./, "");
  const client = getClient({ apiVersion: DEFAULT_API_VERSION });
  const query = `!defined(*[_type == $type && !(_id in [$draft, $published]) && uri.current == $uri][0]._id)`;
  return client.fetch<boolean>(query, {
    type: document._type,
    draft: `drafts.${id}`,
    published: id,
    uri,
  });
}

/**
 * URI primitive for route-owning documents. Stores the full public path
 * (`/about`, `/pricing/enterprise`) with a leading slash, lowercase
 * kebab-case segments, unique per type. `/` is reserved for the homepage.
 */
export function createUriField({
  group,
  required = true,
  source = "title",
}: UriFieldOptions = {}) {
  return defineField({
    name: "uri",
    title: "Path",
    type: "slug",
    group,
    description: "Full path with a leading slash, e.g. /about",
    components: { input: UriInput },
    options: {
      source,
      slugify: toUri,
      isUnique: isUniqueUri,
    },
    validation: (rule) => {
      const rules = [
        rule.custom((value) => {
          const current = (value as { current?: string } | undefined)?.current;
          if (!current) return true;
          if (current === "/") return "The root path belongs to the homepage";
          if (!URI_PATTERN.test(current)) {
            return "Use lowercase letters, numbers and dashes, separated by slashes";
          }
          if (normalizePath(current) !== current)
            return "Remove the trailing slash";
          return true;
        }),
      ];
      if (required) rules.push(rule.required());
      return rules;
    },
  });
}
