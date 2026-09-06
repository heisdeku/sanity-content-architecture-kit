"use client";

import { NextStudio } from "next-sanity/studio/client-component";
import config from "@/sanity.config";

/**
 * The Studio config pulls the whole `sanity` package, which only runs in the
 * browser. Importing it from a Server Component drags it into the RSC bundle
 * (and breaks the build), so the config is only referenced here.
 */
export function Studio() {
  return <NextStudio config={config} />;
}
