import Link from "next/link";
import { RichText } from "@/features/rich-text/rich-text";
import { resolveLink } from "@/features/sanity/resolve-link";
import type { Site } from "@/features/sanity/types";
import { asRoute } from "@/features/utils/route-href";

/** Human 404 body. Copy comes from `site.notFound` with a built-in fallback. */
export function NotFoundContent({ site }: { site: Site | null }) {
  const content = site?.notFound;
  const link = resolveLink(content?.link ?? null);
  return (
    <main className="container-prose section-y">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 text-3xl font-semibold">
        {content?.title ?? "Page not found"}
      </h1>
      {content?.description?.length ? (
        <RichText
          value={content.description}
          className="mt-4 text-muted-foreground"
        />
      ) : (
        <p className="mt-4 text-muted-foreground">
          The page you asked for does not exist or has moved.
        </p>
      )}
      <Link
        href={asRoute(link && !link.external ? link.href : "/")}
        className="mt-8 inline-block underline underline-offset-4"
      >
        {link?.label ?? "Back to the homepage"}
      </Link>
    </main>
  );
}
