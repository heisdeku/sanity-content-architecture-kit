import { cn } from "@/features/style/cn";

export type HeadingValue = {
  text?: string | null;
  level?: string | null;
} | null;

const LEVEL_CLASSES: Record<string, string> = {
  h1: "text-4xl font-semibold leading-[1.05] sm:text-5xl lg:text-6xl",
  h2: "text-3xl font-semibold leading-tight sm:text-4xl",
  h3: "text-2xl font-semibold leading-snug",
  h4: "text-xl font-semibold leading-snug",
};

type HeadingProps = {
  heading: HeadingValue;
  className?: string;
  fallbackLevel?: "h1" | "h2" | "h3" | "h4";
};

/** Renders an `appHeading` at its stored semantic level. */
export function Heading({
  heading,
  className,
  fallbackLevel = "h2",
}: HeadingProps) {
  const text = heading?.text?.trim();
  if (!text) return null;
  const level =
    heading?.level && heading.level in LEVEL_CLASSES
      ? heading.level
      : fallbackLevel;
  const Tag = level as "h1" | "h2" | "h3" | "h4";
  return <Tag className={cn(LEVEL_CLASSES[level], className)}>{text}</Tag>;
}
