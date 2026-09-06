import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticlePage } from "@/features/articles/article-page";
import { safe, sanityFetch } from "@/features/sanity/fetch";
import { ogImageUrl } from "@/features/sanity/image";
import { docTags } from "@/features/sanity/tags";
import { getSite } from "@/features/site/get-site";
import { ArticleJsonLd } from "@/features/site/json-ld";
import { buildMetadata } from "@/features/site/metadata";
import { ARTICLE_BY_SLUG_QUERY } from "@/sanity/queries/documents/article";

async function loadArticle(params: PageProps<"/articles/[slug]">["params"]) {
  const { slug } = await params;
  const path = `/articles/${slug}`;
  const { data } = await safe(
    sanityFetch({
      query: ARTICLE_BY_SLUG_QUERY,
      params: { slug },
      tags: docTags({ type: "article", path }),
    }),
  );
  return { path, article: data };
}

export async function generateMetadata({
  params,
}: PageProps<"/articles/[slug]">): Promise<Metadata> {
  const [site, { article, path }] = await Promise.all([
    getSite(),
    loadArticle(params),
  ]);
  return buildMetadata({
    site,
    seo: article?.seo ?? { description: article?.excerpt },
    title: article?.title,
    path,
    type: "article",
    publishedAt: article?.publishedAt,
  });
}

export default async function Article({
  params,
}: PageProps<"/articles/[slug]">) {
  const { article, path } = await loadArticle(params);
  if (!article) notFound();
  const cover = article.cover?.kind === "image" ? article.cover.image : null;
  return (
    <>
      <ArticleJsonLd
        title={article.title ?? path}
        path={path}
        description={article.seo?.description ?? article.excerpt}
        author={article.author}
        publishedAt={article.publishedAt}
        updatedAt={article._updatedAt}
        image={ogImageUrl(cover ?? null)}
      />
      <ArticlePage article={article} />
    </>
  );
}
