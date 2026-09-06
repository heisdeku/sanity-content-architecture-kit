import Link from "next/link";
import { Icon } from "@/features/page-builder/icon";
import { type LinkValue, resolveLink } from "@/features/sanity/resolve-link";
import { cn } from "@/features/style/cn";
import { asRoute } from "@/features/utils/route-href";

export type ButtonValue = {
  label?: string | null;
  variant?: string | null;
  icon?: string | null;
  link?: LinkValue;
} | null;

const VARIANTS: Record<string, string> = {
  primary: "bg-accent text-accent-foreground hover:opacity-90",
  secondary:
    "border border-border bg-surface text-foreground hover:border-foreground",
  ghost:
    "text-foreground underline decoration-muted underline-offset-4 hover:decoration-foreground px-0",
};

/** Renders an `appButton`. Skips silently when the link cannot resolve. */
export function Button({
  button,
  className,
}: {
  button: ButtonValue;
  className?: string;
}) {
  const resolved = resolveLink(button?.link ?? null);
  if (!resolved) return null;
  const variant =
    button?.variant && button.variant in VARIANTS ? button.variant : "primary";
  const classes = cn(
    "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
    VARIANTS[variant],
    className,
  );
  const content = (
    <>
      {button?.label || resolved.label}
      <Icon name={button?.icon} />
    </>
  );

  if (resolved.external || resolved.download) {
    return (
      <a
        href={resolved.href}
        target={resolved.target}
        rel={resolved.rel}
        download={resolved.download}
        className={classes}
      >
        {content}
      </a>
    );
  }
  return (
    <Link
      href={asRoute(resolved.href)}
      target={resolved.target}
      rel={resolved.rel}
      className={classes}
    >
      {content}
    </Link>
  );
}
