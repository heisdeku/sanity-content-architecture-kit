import type { ComponentPropsWithoutRef } from 'react';

export const HONEYPOT_FIELD = '_hp';

/**
 * A field humans never see and bots love to fill. Visually hidden, excluded
 * from the tab order, and ignored by assistive tech.
 */
export function Honeypot(props: ComponentPropsWithoutRef<'input'>) {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        Leave this field empty
        <input type="text" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" {...props} />
      </label>
    </div>
  );
}
