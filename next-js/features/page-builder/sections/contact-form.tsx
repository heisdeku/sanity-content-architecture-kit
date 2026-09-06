import { ContactForm } from "@/features/forms/contact-form";
import { Heading } from "@/features/page-builder/heading";
import { Section } from "@/features/page-builder/section";
import { RichText } from "@/features/rich-text/rich-text";
import type { ContactFormSection } from "@/features/sanity/types";
import { createTimingToken } from "@/features/spam-prevention/timing-token";

export function ContactFormBlock({ section }: { section: ContactFormSection }) {
  return (
    <Section type={section._type} width="wide">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="flex flex-col gap-5">
          <Heading heading={section.heading} />
          <RichText
            value={section.description}
            className="text-muted-foreground"
          />
        </div>
        <ContactForm
          timingToken={createTimingToken()}
          successMessage={section.successMessage ?? undefined}
        />
      </div>
    </Section>
  );
}
