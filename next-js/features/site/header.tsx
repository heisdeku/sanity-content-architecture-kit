import Link from "next/link";
import { Media } from "@/features/media/media";
import type { Site } from "@/features/sanity/types";
import { DEFAULT_SITE_NAME } from "@/features/site/metadata";
import { NavigationLink } from "@/features/site/navigation-link";

export function Header({ site }: { site: Site | null }) {
  const items = site?.navigation?.headerItems ?? [];
  return (
    <header className="border-b border-border">
      <div className="container-x flex h-16 items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-3 font-medium">
          {site?.logo?.kind ? (
            <span className="block h-7 w-auto">
              <Media
                media={site.logo}
                sizes="120px"
                className="h-7 w-auto bg-transparent"
              />
            </span>
          ) : null}
          <span className="font-mono text-sm tracking-tight">
            {site?.name ?? DEFAULT_SITE_NAME}
          </span>
        </Link>
        {items.length ? (
          <nav aria-label="Main">
            <ul className="flex items-center gap-6 text-sm">
              {items.map((item) => (
                <li key={item._key}>
                  <NavigationLink
                    link={item.link}
                    label={item.label}
                    className="text-muted-foreground hover:text-foreground"
                  />
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </div>
    </header>
  );
}
