import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageBuilder } from "@/features/page-builder/page-builder";
import { safe, sanityFetch } from "@/features/sanity/fetch";
import { docTags } from "@/features/sanity/tags";
import { getSite } from "@/features/site/get-site";
import { buildMetadata } from "@/features/site/metadata";
import { PAGE_BY_URI_QUERY } from "@/sanity/queries/documents/page";

async function loadPage(params: PageProps<"/[...uri]">["params"]) {
  const { uri } = await params;
  const path = `/${uri.map(decodeURIComponent).join("/")}`;
  const { data, error } = await safe(
    sanityFetch({
      query: PAGE_BY_URI_QUERY,
      params: { uri: path },
      tags: docTags({ type: "page", path }),
    }),
  );
  return { path, page: data, error };
}

export async function generateMetadata({
  params,
}: PageProps<"/[...uri]">): Promise<Metadata> {
  const [site, { page, path }] = await Promise.all([
    getSite(),
    loadPage(params),
  ]);
  return buildMetadata({ site, seo: page?.seo, title: page?.title, path });
}

export default async function Page({ params }: PageProps<"/[...uri]">) {
  const { page } = await loadPage(params);
  // An unreachable CMS cannot vouch for this path, so it is a real 404 (logged by `safe`).
  if (!page) notFound();
  return (
    <main>
      <PageBuilder sections={page.pageBuilder} />
    </main>
  );
}
