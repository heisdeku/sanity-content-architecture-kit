import type { FieldMember, ObjectInputProps, ObjectMember } from "sanity";
import { MEDIA_KINDS, type MediaKind } from "../config/constants";
import type { MediaFieldOptions } from "../schemas/fields/create-media-field";

type ListOption = { value?: string; title?: string };

function withFilteredKindList(
  member: FieldMember,
  allowed: readonly MediaKind[],
): ObjectMember {
  const schemaType = member.field.schemaType;
  const options = (schemaType.options ?? {}) as { list?: ListOption[] };
  if (!Array.isArray(options.list)) return member;
  const list = options.list.filter((option) =>
    allowed.includes(option.value as MediaKind),
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
 * Input for `appMedia`. Reads the factory options stored on the field
 * (`allowed`, `withCustomRatio`) and hides the members that do not apply.
 */
export function MediaInput(props: ObjectInputProps) {
  const options = (props.schemaType.options ?? {}) as Pick<
    MediaFieldOptions,
    "allowed" | "withCustomRatio"
  >;
  const allowed = options.allowed ?? MEDIA_KINDS;
  const hiddenFields = new Set<string>(
    MEDIA_KINDS.filter((kind) => !allowed.includes(kind)),
  );
  if (!options.withCustomRatio) hiddenFields.add("customRatio");

  const members = props.members
    .filter(
      (member) => member.kind !== "field" || !hiddenFields.has(member.name),
    )
    .map((member) =>
      member.kind === "field" &&
      member.name === "kind" &&
      allowed.length < MEDIA_KINDS.length
        ? withFilteredKindList(member, allowed)
        : member,
    );

  // A single allowed kind needs no toggle at all.
  const visible =
    allowed.length === 1
      ? members.filter((m) => m.kind !== "field" || m.name !== "kind")
      : members;

  return props.renderDefault({ ...props, members: visible });
}
