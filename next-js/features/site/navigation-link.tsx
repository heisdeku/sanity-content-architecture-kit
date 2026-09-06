import Link from "next/link";
import { type LinkValue, resolveLink } from "@/features/sanity/resolve-link";
import { asRoute } from "@/features/utils/route-href";

type NavigationLinkProps = {
  link: LinkValue;
  label?: string | null;
  className?: string;
};

/** Anchor for a navigation item. Renders nothing when the link cannot resolve. */
export function NavigationLink({
  link,
  label,
  className,
}: NavigationLinkProps) {
  const resolved = resolveLink(link);
  if (!resolved) return null;
  const text = label || resolved.label;
  if (resolved.external || resolved.download) {
    return (
      <a
        href={resolved.href}
        target={resolved.target}
        rel={resolved.rel}
        className={className}
      >
        {text}
      </a>
    );
  }
  return (
    <Link href={asRoute(resolved.href)} className={className}>
      {text}
    </Link>
  );
}
