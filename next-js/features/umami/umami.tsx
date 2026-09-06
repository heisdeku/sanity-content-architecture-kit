import Script from "next/script";
import { env } from "@/env";

/** Renders the Umami script only when both public env vars are set. */
export function Umami() {
  const id = env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  const src = env.NEXT_PUBLIC_UMAMI_SRC;
  if (!id || !src) return null;
  return <Script src={src} data-website-id={id} strategy="afterInteractive" />;
}
