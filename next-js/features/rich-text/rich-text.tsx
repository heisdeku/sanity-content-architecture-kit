import {
  PortableText,
  type PortableTextBlock,
  type PortableTextComponents,
} from "@portabletext/react";
import Link from "next/link";
import { Media, type MediaValue } from "@/features/media/media";
import { type ImageValue, SanityImage } from "@/features/media/sanity-image";
import { type LinkValue, resolveLink } from "@/features/sanity/resolve-link";
import { cn } from "@/features/style/cn";
import { asRoute } from "@/features/utils/route-href";

type RichTextProps = {
  value: unknown;
  className?: string;
};

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p>{children}</p>,
    h2: ({ children }) => <h2>{children}</h2>,
    h3: ({ children }) => <h3>{children}</h3>,
    h4: ({ children }) => <h4>{children}</h4>,
    blockquote: ({ children }) => <blockquote>{children}</blockquote>,
  },
  marks: {
    strong: ({ children }) => <strong>{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    code: ({ children }) => <code>{children}</code>,
    link: ({ children, value }) => {
      const resolved = resolveLink((value ?? null) as LinkValue);
      if (!resolved) return <>{children}</>;
      if (resolved.external || resolved.download) {
        return (
          <a
            href={resolved.href}
            target={resolved.target}
            rel={resolved.rel}
            download={resolved.download}
          >
            {children}
          </a>
        );
      }
      return (
        <Link href={asRoute(resolved.href)} target={resolved.target}>
          {children}
        </Link>
      );
    },
  },
  types: {
    appMedia: ({ value }) => (
      <figure>
        <Media
          media={value as MediaValue}
          sizes="(min-width: 768px) 42rem, 100vw"
        />
      </figure>
    ),
    appImage: ({ value }) => (
      <figure>
        <SanityImage
          image={value as ImageValue}
          sizes="(min-width: 768px) 42rem, 100vw"
        />
      </figure>
    ),
  },
  list: {
    bullet: ({ children }) => <ul>{children}</ul>,
    number: ({ children }) => <ol>{children}</ol>,
  },
};

/** Renders an `appRichText` (Portable Text) array with editorial defaults. */
export function RichText({ value, className }: RichTextProps) {
  if (!Array.isArray(value) || value.length === 0) return null;
  return (
    <div className={cn("prose-editorial", className)}>
      <PortableText
        value={value as PortableTextBlock[]}
        components={components}
      />
    </div>
  );
}
