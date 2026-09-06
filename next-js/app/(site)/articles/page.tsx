import type { Metadata } from "next";
import { ArticleIndex } from "@/features/articles/article-index";
import { safe, sanityFetch } from "@/features/sanity/fetch";
import { typeTag } from "@/features/sanity/tags";
import { getSite } from "@/features/site/get-site";
import { buildMetadata } from "@/features/site/metadata";
import { ARTICLES_QUERY } from "@/sanity/queries/documents/article";

// draftMode() alone does not opt out of prerendering in Next 16; be explicit so the build never calls Sanity.
export const dynamic = "force-dynamic";

const tags = [typeTag("article"), typeTag("category")];

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  return buildMetadata({ site, title: "Articles", path: "/articles" });
}

export default async function ArticlesPage() {
  const { data } = await safe(
    sanityFetch({ query: ARTICLES_QUERY, params: { limit: 60 }, tags }),
  );
  return <ArticleIndex articles={data ?? []} />;
}
