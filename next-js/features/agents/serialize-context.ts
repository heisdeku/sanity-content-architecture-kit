/** Shared context the recursive serializer threads through every node. */
export type SerializeContext = {
  /** Absolute href for an `appLink` (or link annotation). Null when unresolvable. */
  resolveHref: (link: Record<string, unknown>) => string | null;
  /** Absolute image URL for an `appMedia` image, or a playable URL for video. */
  resolveMediaUrl: (media: Record<string, unknown>) => string | null;
  /** Serialize any object node; used for custom Portable Text blocks. */
  serializeNode: (node: Record<string, unknown>) => string;
};
