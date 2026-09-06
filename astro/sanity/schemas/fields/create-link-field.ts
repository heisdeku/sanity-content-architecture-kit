import { defineField } from "sanity";
import { LINK_KINDS, type LinkKind } from "../../config/constants";

export type LinkFieldOptions = {
  name?: string;
  title?: string;
  description?: string;
  group?: string;
  required?: boolean;
  /** Hide the label field (the target's title is used instead). */
  noCustomText?: boolean;
  /** Restrict the kinds an editor can pick. Defaults to every kind. */
  allowed?: readonly LinkKind[];
};

/**
 * Link primitive. Produces an `appLink` object: a typed union of internal
 * reference, external URL, email, phone, file download and URL params.
 * Internal links store a reference, never a copied path, so a slug change
 * never rots a link. Options are read by the `appLink` input component.
 */
export function createLinkField({
  name = "link",
  title = "Link",
  description,
  group,
  required = false,
  noCustomText = false,
  allowed = LINK_KINDS,
}: LinkFieldOptions = {}) {
  const allowedKinds = allowed.filter((kind) => LINK_KINDS.includes(kind));
  const initialKind = allowedKinds[0] ?? "internal";

  return defineField({
    name,
    title,
    description,
    type: "appLink",
    group,
    initialValue: { kind: initialKind },
    options: { allowed: allowedKinds, noCustomText },
    validation: (rule) => {
      const rules = [
        rule.custom((value) => {
          const kind = (value as { kind?: LinkKind } | undefined)?.kind;
          if (!kind || allowedKinds.includes(kind)) return true;
          return `Link type "${kind}" is not allowed here`;
        }),
      ];
      if (required) rules.push(rule.required());
      return rules;
    },
  });
}
