import { ArticleCard } from "@/features/articles/article-card";
import type { ArticleCard as ArticleCardValue } from "@/features/sanity/types";

export function ArticleIndex({
  articles,
  title = "Articles",
}: {
  articles: ArticleCardValue[];
  title?: string;
}) {
  return (
    <main className="container-x section-y">
      <h1 className="mb-12 text-4xl font-semibold">{title}</h1>
      {articles.length === 0 ? (
        <p className="text-muted">No articles published yet.</p>
      ) : (
        <ul className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <li key={article._id}>
              <ArticleCard article={article} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
