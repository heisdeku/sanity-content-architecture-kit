"use client";

type UmamiWindow = Window & {
  umami?: { track: (event: string, data?: Record<string, unknown>) => void };
};

/** Fire a custom Umami event. Silent no-op when the script is absent. */
export function track(event: string, data?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  (window as UmamiWindow).umami?.track(event, data);
}
