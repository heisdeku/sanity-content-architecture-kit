import { Geist, Geist_Mono } from "next/font/google";

/**
 * Fonts are loaded through next/font, which self-hosts them and removes
 * layout shift. Google fonts keep the repo free of binary font files.
 *
 * To swap to local fonts:
 *   import localFont from "next/font/local";
 *   export const fontSans = localFont({
 *     src: [{ path: "./sans.woff2", weight: "100 900" }],
 *     variable: "--font-sans-family",
 *     display: "swap",
 *   });
 * and drop the files next to this module. Keep the `variable` names: the
 * `@theme` block in app/globals.css maps them to `font-sans` / `font-mono`.
 */
export const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans-family",
  display: "swap",
});

export const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono-family",
  display: "swap",
});

export const fontClassName = `${fontSans.variable} ${fontMono.variable}`;
