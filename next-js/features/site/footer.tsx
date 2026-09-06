import type { Site } from "@/features/sanity/types";
import { DEFAULT_SITE_NAME } from "@/features/site/metadata";
import { NavigationLink } from "@/features/site/navigation-link";

export function Footer({ site }: { site: Site | null }) {
  const columns = site?.navigation?.footerColumns ?? [];
  const socials = site?.navigation?.socialLinks ?? [];
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border">
      <div className="container-x section-y flex flex-col gap-10">
        {columns.length ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {columns.map((column) => (
              <div key={column._key}>
                <p className="eyebrow mb-3">{column.title}</p>
                <ul className="flex flex-col gap-2 text-sm">
                  {column.items?.map((item) => (
                    <li key={item._key}>
                      <NavigationLink
                        link={item.link}
                        label={item.label}
                        className="text-muted-foreground hover:text-foreground"
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : null}
        <div className="flex flex-col gap-4 border-t border-border pt-6 font-mono text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            {year} {site?.name ?? DEFAULT_SITE_NAME}
            {site?.tagline ? `. ${site.tagline}` : ""}
          </p>
          {socials.length ? (
            <ul className="flex gap-4">
              {socials.map((social) => (
                <li key={social._key}>
                  <NavigationLink
                    link={social.link}
                    label={social.platform}
                    className="hover:text-foreground"
                  />
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
