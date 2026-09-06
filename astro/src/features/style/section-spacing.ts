/**
 * Vertical rhythm is owned by the system, not the editor. Sections pick one
 * of these tokens; the values live in globals.css (@theme spacing-section-*).
 */
export const SECTION_SPACING = {
  none: '',
  default: 'section-spacing',
  tight: 'py-8 md:py-12',
} as const;

export type SectionSpacing = keyof typeof SECTION_SPACING;
