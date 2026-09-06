import type { Metadata } from "next";
import { connection } from "next/server";
import { Footer } from "@/features/site/footer";
import { getPublishedSite } from "@/features/site/get-site";
import { Header } from "@/features/site/header";
import { NotFoundContent } from "@/features/site/not-found-content";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

/**
 * Unmatched URLs (including the proxy's real-404 rewrite) land here, outside
 * the (site) group, so this renders its own shell. Request-time only.
 */
export default async function NotFound() {
  await connection();
  const site = await getPublishedSite();
  return (
    <>
      <Header site={site} />
      <NotFoundContent site={site} />
      <Footer site={site} />
    </>
  );
}
