import { Media } from "@/features/media/media";
import { Heading } from "@/features/page-builder/heading";
import { Section } from "@/features/page-builder/section";
import { RichText } from "@/features/rich-text/rich-text";
import type { ImageTextSection } from "@/features/sanity/types";
import { cn } from "@/features/style/cn";

export function ImageText({ section }: { section: ImageTextSection }) {
  const mediaLeft = section.imagePosition === "left";
  return (
    <Section type={section._type} width="wide">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div className={cn("flex flex-col gap-5", mediaLeft && "lg:order-2")}>
          <Heading heading={section.heading} />
          <RichText value={section.body} />
        </div>
        <Media
          media={section.media}
          className={cn("rounded-md", mediaLeft && "lg:order-1")}
          sizes="(min-width: 1024px) 50vw, 100vw"
        />
      </div>
    </Section>
  );
}
