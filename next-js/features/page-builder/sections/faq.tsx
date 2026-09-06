import { Heading } from "@/features/page-builder/heading";
import { Section } from "@/features/page-builder/section";
import { RichText } from "@/features/rich-text/rich-text";
import type { FaqSection } from "@/features/sanity/types";

export function Faq({ section }: { section: FaqSection }) {
  return (
    <Section type={section._type} width="prose">
      <Heading heading={section.heading} className="mb-8" />
      <div className="divide-y divide-border border-y border-border">
        {section.items?.map((item) => (
          <details key={item._key} className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-medium">
              {item.question}
              <span
                aria-hidden="true"
                className="font-mono text-muted transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <RichText
              value={item.answer}
              className="mt-4 text-muted-foreground"
            />
          </details>
        ))}
      </div>
    </Section>
  );
}
