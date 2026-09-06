import { Media } from "@/features/media/media";
import { PageBuilder } from "@/features/page-builder/page-builder";
import type { Article } from "@/features/sanity/types";
import { formatDate } from "@/features/utils/format-date";
import { ViewTransition } from "@/features/view-transition/view-transition";

export function ArticlePage({ article }: { article: Article }) {
  return (
    <main>
      <header className="container-prose section-y pb-0!">
        <p className="eyebrow">
          {formatDate(article.publishedAt)}
          {article.author ? ` · ${article.author}` : ""}
          {article.categories?.length
            ? ` · ${article.categories.map((c) => c.title).join(", ")}`
            : ""}
        </p>
        <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
          {article.title}
        </h1>
        {article.excerpt ? (
          <p className="mt-5 text-lg text-muted-foreground">
            {article.excerpt}
          </p>
        ) : null}
      </header>
      {article.cover?.kind ? (
        <div className="container-content mt-10">
          <ViewTransition name={`article-cover-${article._id}`}>
            <Media
              media={article.cover}
              priority
              className="rounded-md"
              sizes="(min-width: 1024px) 64rem, 100vw"
            />
          </ViewTransition>
        </div>
      ) : null}
      <PageBuilder sections={article.pageBuilder} />
    </main>
  );
}
