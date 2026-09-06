import type { MetadataRoute } from "next";
import { buildSitemap } from "@/features/site/sitemap";

export const dynamic = "force-dynamic";

export default function sitemap(): Promise<MetadataRoute.Sitemap> {
  return buildSitemap();
}
