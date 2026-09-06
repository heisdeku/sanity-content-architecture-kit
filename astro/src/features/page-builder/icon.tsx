import { icons, type LucideProps } from 'lucide-react';

/** Renders a lucide icon by its kebab-case name from ICON_NAMES. Server-rendered, no island. */
export function Icon({ name, ...props }: LucideProps & { name: string | null | undefined }) {
  if (!name) return null;
  const pascal = name.replace(/(^|-)([a-z])/g, (_, __, c: string) =>
    c.toUpperCase(),
  ) as keyof typeof icons;
  const Component = icons[pascal];
  return Component ? <Component aria-hidden="true" {...props} /> : null;
}
