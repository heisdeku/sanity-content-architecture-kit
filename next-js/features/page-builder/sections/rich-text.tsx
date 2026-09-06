import { Section } from "@/features/page-builder/section";
import { RichText } from "@/features/rich-text/rich-text";
import type { RichTextSection } from "@/features/sanity/types";

export function RichTextBlock({ section }: { section: RichTextSection }) {
  return (
    <Section type={section._type} width="prose">
      <RichText value={section.body} />
    </Section>
  );
}
