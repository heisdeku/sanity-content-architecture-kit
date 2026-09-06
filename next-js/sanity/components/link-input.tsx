import type { FieldMember, ObjectInputProps, ObjectMember } from "sanity";
import { LINK_KINDS, type LinkKind } from "../config/constants";
import type { LinkFieldOptions } from "../schemas/fields/create-link-field";

const KIND_FIELDS: Record<LinkKind, string> = {
  internal: "internal",
  external: "href",
  email: "email",
  phone: "phone",
  file: "file",
  params: "params",
};

type ListOption = { value?: string; title?: string };

function withFilteredKindList(
  member: FieldMember,
  allowed: readonly LinkKind[],
): ObjectMember {
  const schemaType = member.field.schemaType;
  const options = (schemaType.options ?? {}) as { list?: ListOption[] };
  if (!Array.isArray(options.list)) return member;
  const list = options.list.filter((option) =>
    allowed.includes(option.value as LinkKind),
  );
  return {
    ...member,
    field: {
      ...member.field,
      schemaType: { ...schemaType, options: { ...options, list } },
    },
  } as ObjectMember;
}

/**
 * Input for `appLink`. Reads the factory options stored on the field
 * (`allowed`, `noCustomText`) and hides the members that do not apply, so
 * one named object type serves every call site.
 */
export function LinkInput(props: ObjectInputProps) {
  const options = (props.schemaType.options ?? {}) as Pick<
    LinkFieldOptions,
    "allowed" | "noCustomText"
  >;
  const allowed = options.allowed ?? LINK_KINDS;
  const hiddenFields = new Set(
    LINK_KINDS.filter((kind) => !allowed.includes(kind)).map(
      (kind) => KIND_FIELDS[kind],
    ),
  );
  if (options.noCustomText) hiddenFields.add("label");

  const members = props.members
    .filter(
      (member) => member.kind !== "field" || !hiddenFields.has(member.name),
    )
    .map((member) =>
      member.kind === "field" &&
      member.name === "kind" &&
      allowed.length < LINK_KINDS.length
        ? withFilteredKindList(member, allowed)
        : member,
    );

  return props.renderDefault({ ...props, members });
}
