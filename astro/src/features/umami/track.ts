type Umami = { track: (name: string, data?: Record<string, unknown>) => void };

/** Fire a custom Umami event. Safe to call when the script is absent. */
export function track(name: string, data?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  const umami = (window as Window & { umami?: Umami }).umami;
  umami?.track(name, data);
}
