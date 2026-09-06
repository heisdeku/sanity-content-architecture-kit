import Link from "next/link";
import { Media } from "@/features/media/media";
import type { ArticleCard as ArticleCardValue } from "@/features/sanity/types";
import { formatDate } from "@/features/utils/format-date";
import { asRoute } from "@/features/utils/route-href";
import { ViewTransition } from "@/features/view-transition/view-transition";

export function ArticleCard({ article }: { article: ArticleCardValue }) {
  const href = asRoute(`/articles/${article.slug}`);
  return (
    <article className="flex flex-col gap-4">
      {article.cover?.kind ? (
        <Link href={href} tabIndex={-1} aria-hidden="true">
          <ViewTransition name={`article-cover-${article._id}`}>
            <Media
              media={article.cover}
              className="rounded-md"
              sizes="(min-width: 1024px) 33vw, 100vw"
            />
          </ViewTransition>
        </Link>
      ) : null}
      <div className="flex flex-col gap-2">
        <p className="eyebrow">
          {formatDate(article.publishedAt)}
          {article.categories?.length
            ? ` · ${article.categories.map((c) => c.title).join(", ")}`
            : ""}
        </p>
        <h3 className="text-xl font-semibold leading-snug">
          <Link href={href} className="hover:underline underline-offset-4">
            {article.title}
          </Link>
        </h3>
        {article.excerpt ? (
          <p className="text-muted-foreground">{article.excerpt}</p>
        ) : null}
      </div>
    </article>
  );
}
