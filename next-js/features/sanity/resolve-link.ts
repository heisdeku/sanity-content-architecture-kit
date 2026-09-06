import { getDocumentPath } from "@/sanity/lib/document-path";

/** Structural shape of a resolved `appLink` (LINK_FRAGMENT). */
export type LinkValue = {
  kind?: string | null;
  label?: string | null;
  newTab?: boolean | null;
  download?: boolean | null;
  href?: string | null;
  email?: string | null;
  phone?: string | null;
  params?: string | null;
  file?: { url?: string | null; originalFilename?: string | null } | null;
  internal?: {
    _type: string;
    title?: string | null;
    uri?: string | null;
    slug?: string | null;
  } | null;
} | null;

export type ResolvedLink = {
  href: string;
  label: string;
  target?: "_blank";
  rel?: string;
  download?: boolean;
  external: boolean;
};

/**
 * The single owner of every URL. Turns an `appLink` into an anchor spec.
 * Returns null for an unresolvable link (missing target), so callers can
 * skip rendering instead of emitting a dead anchor.
 */
export function resolveLink(link: LinkValue): ResolvedLink | null {
  if (!link?.kind) return null;

  switch (link.kind) {
    case "internal": {
      const path = getDocumentPath(link.internal);
      if (!path) return null;
      return {
        href: path,
        label: link.label || link.internal?.title || path,
        external: false,
        ...(link.newTab ? { target: "_blank" as const, rel: "noopener" } : {}),
      };
    }
    case "external": {
      if (!link.href) return null;
      return {
        href: link.href,
        label: link.label || link.href,
        external: true,
        ...(link.newTab !== false
          ? { target: "_blank" as const, rel: "noopener noreferrer" }
          : {}),
      };
    }
    case "email":
      if (!link.email) return null;
      return {
        href: `mailto:${link.email}`,
        label: link.label || link.email,
        external: true,
      };
    case "phone":
      if (!link.phone) return null;
      return {
        href: `tel:${link.phone.replace(/[^\d+]/g, "")}`,
        label: link.label || link.phone,
        external: true,
      };
    case "file": {
      const url = link.file?.url;
      if (!url) return null;
      return {
        href: url,
        label: link.label || link.file?.originalFilename || "Download",
        external: true,
        download: link.download !== false,
        ...(link.newTab ? { target: "_blank" as const, rel: "noopener" } : {}),
      };
    }
    case "params":
      if (!link.params) return null;
      return {
        href: link.params,
        label: link.label || link.params,
        external: false,
      };
    default:
      return null;
  }
}
