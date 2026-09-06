import { Media } from "@/features/media/media";
import { Section } from "@/features/page-builder/section";
import type { MediaSection } from "@/features/sanity/types";

export function MediaBlock({ section }: { section: MediaSection }) {
  return (
    <Section type={section._type} width="wide">
      <figure>
        <Media
          media={section.media}
          className="rounded-md"
          sizes="(min-width: 1280px) 1280px, 100vw"
        />
        {section.caption ? (
          <figcaption className="mt-3 font-mono text-xs text-muted">
            {section.caption}
          </figcaption>
        ) : null}
      </figure>
    </Section>
  );
}
