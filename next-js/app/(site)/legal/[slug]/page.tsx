import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalPage } from "@/features/legal/legal-page";
import { safe, sanityFetch } from "@/features/sanity/fetch";
import { docTags } from "@/features/sanity/tags";
import { getSite } from "@/features/site/get-site";
import { buildMetadata } from "@/features/site/metadata";
import { LEGAL_BY_SLUG_QUERY } from "@/sanity/queries/documents/legal";

async function loadLegal(params: PageProps<"/legal/[slug]">["params"]) {
  const { slug } = await params;
  const path = `/legal/${slug}`;
  const { data } = await safe(
    sanityFetch({
      query: LEGAL_BY_SLUG_QUERY,
      params: { slug },
      tags: docTags({ type: "legalPage", path }),
    }),
  );
  return { path, page: data };
}

export async function generateMetadata({
  params,
}: PageProps<"/legal/[slug]">): Promise<Metadata> {
  const [site, { page, path }] = await Promise.all([
    getSite(),
    loadLegal(params),
  ]);
  return buildMetadata({ site, seo: page?.seo, title: page?.title, path });
}

export default async function Legal({ params }: PageProps<"/legal/[slug]">) {
  const { page } = await loadLegal(params);
  if (!page) notFound();
  return <LegalPage page={page} />;
}
