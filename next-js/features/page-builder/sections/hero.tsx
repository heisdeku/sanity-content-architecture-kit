import { Media } from "@/features/media/media";
import { Button } from "@/features/page-builder/button";
import { Heading } from "@/features/page-builder/heading";
import { Section } from "@/features/page-builder/section";
import { RichText } from "@/features/rich-text/rich-text";
import type { HeroSection } from "@/features/sanity/types";

export function Hero({ section }: { section: HeroSection }) {
  const hasMedia = Boolean(section.media?.kind);
  return (
    <Section
      type={section._type}
      width="wide"
      className="pt-(--spacing-section-sm)"
    >
      <div
        className={
          hasMedia ? "grid items-center gap-10 lg:grid-cols-2" : "max-w-3xl"
        }
      >
        <div className="flex flex-col gap-6">
          {section.eyebrow ? (
            <p className="eyebrow">{section.eyebrow}</p>
          ) : null}
          <Heading heading={section.heading} fallbackLevel="h1" />
          <RichText
            value={section.description}
            className="text-lg text-muted-foreground"
          />
          {section.buttons?.length ? (
            <div className="flex flex-wrap gap-3">
              {section.buttons.map((button) => (
                <Button key={button._key} button={button} />
              ))}
            </div>
          ) : null}
        </div>
        {hasMedia ? (
          <Media
            media={section.media}
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
        ) : null}
      </div>
    </Section>
  );
}
