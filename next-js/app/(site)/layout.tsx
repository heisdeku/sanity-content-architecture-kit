import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import type { ReactNode } from "react";
import { DraftModeBanner } from "@/features/draft-mode/draft-mode-banner";
import { Lenis } from "@/features/lenis";
import { Footer } from "@/features/site/footer";
import { getSite } from "@/features/site/get-site";
import { Header } from "@/features/site/header";
import { WebSiteJsonLd } from "@/features/site/json-ld";
import { Umami } from "@/features/umami/umami";

/** Site shell for every public route. Studio and route handlers stay outside. */
export default async function SiteLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [site, { isEnabled: isDraft }] = await Promise.all([
    getSite(),
    draftMode(),
  ]);

  return (
    <>
      {isDraft ? <DraftModeBanner /> : null}
      <Lenis>
        <Header site={site} />
        {children}
        <Footer site={site} />
      </Lenis>
      <WebSiteJsonLd site={site} />
      {isDraft ? <VisualEditing /> : null}
      <Umami />
    </>
  );
}
