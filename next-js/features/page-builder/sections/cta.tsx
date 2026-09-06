import { Button } from "@/features/page-builder/button";
import { Heading } from "@/features/page-builder/heading";
import { Section } from "@/features/page-builder/section";
import { RichText } from "@/features/rich-text/rich-text";
import type { CtaSection } from "@/features/sanity/types";

export function Cta({ section }: { section: CtaSection }) {
  return (
    <Section type={section._type}>
      <div className="flex flex-col items-start gap-6 rounded-md border border-border bg-surface p-8 sm:p-12">
        {section.eyebrow ? <p className="eyebrow">{section.eyebrow}</p> : null}
        <Heading heading={section.heading} />
        <RichText
          value={section.description}
          className="max-w-2xl text-muted-foreground"
        />
        {section.buttons?.length ? (
          <div className="flex flex-wrap gap-3">
            {section.buttons.map((button) => (
              <Button key={button._key} button={button} />
            ))}
          </div>
        ) : null}
      </div>
    </Section>
  );
}
