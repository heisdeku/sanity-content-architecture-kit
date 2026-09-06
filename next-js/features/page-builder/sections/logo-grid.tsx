import { Media } from "@/features/media/media";
import { Heading } from "@/features/page-builder/heading";
import { Section } from "@/features/page-builder/section";
import { resolveLink } from "@/features/sanity/resolve-link";
import type { LogoGridSection } from "@/features/sanity/types";

export function LogoGrid({ section }: { section: LogoGridSection }) {
  return (
    <Section type={section._type}>
      <Heading
        heading={section.heading}
        className="mb-10 text-center text-2xl"
      />
      <ul className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6">
        {section.logos?.map((logo) => {
          const link = resolveLink(logo.link);
          const media = (
            <Media
              media={logo.media}
              sizes="160px"
              className="bg-transparent"
            />
          );
          return (
            <li
              key={logo._key}
              className="flex items-center justify-center opacity-70 transition-opacity hover:opacity-100"
            >
              {link ? (
                <a
                  href={link.href}
                  target={link.target}
                  rel={link.rel}
                  aria-label={logo.name ?? undefined}
                  className="block w-full max-w-40"
                >
                  {media}
                </a>
              ) : (
                <div className="w-full max-w-40" title={logo.name ?? undefined}>
                  {media}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
