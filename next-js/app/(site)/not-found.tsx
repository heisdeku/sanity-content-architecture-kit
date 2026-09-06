import type { Metadata } from "next";
import { getPublishedSite } from "@/features/site/get-site";
import { NotFoundContent } from "@/features/site/not-found-content";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

/** notFound() thrown inside the site group renders here, within the site shell. */
export default async function NotFound() {
  const site = await getPublishedSite();
  return <NotFoundContent site={site} />;
}
