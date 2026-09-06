import type { Metadata } from "next";
import { PageBuilder } from "@/features/page-builder/page-builder";
import { safe, sanityFetch } from "@/features/sanity/fetch";
import { docTags } from "@/features/sanity/tags";
import { ConnectSanity } from "@/features/site/connect-sanity";
import { getSite } from "@/features/site/get-site";
import { buildMetadata } from "@/features/site/metadata";
import { SINGLETON_IDS } from "@/sanity/config/constants";
import { HOMEPAGE_QUERY } from "@/sanity/queries/documents/homepage";

// draftMode() alone does not opt out of prerendering in Next 16; be explicit so the build never calls Sanity.
export const dynamic = "force-dynamic";

const tags = docTags({
  type: "homepage",
  id: SINGLETON_IDS.homepage,
  path: "/",
});

export async function generateMetadata(): Promise<Metadata> {
  const [site, { data }] = await Promise.all([
    getSite(),
    safe(sanityFetch({ query: HOMEPAGE_QUERY, tags })),
  ]);
  return buildMetadata({
    site,
    seo: data?.seo,
    title: data?.title ?? site?.name,
    path: "/",
  });
}

export default async function HomePage() {
  const { data, error } = await safe(
    sanityFetch({ query: HOMEPAGE_QUERY, tags }),
  );
  if (error) return <ConnectSanity reason="unreachable" />;
  if (!data) return <ConnectSanity reason="empty" />;
  return (
    <main>
      <PageBuilder sections={data.pageBuilder} />
    </main>
  );
}
