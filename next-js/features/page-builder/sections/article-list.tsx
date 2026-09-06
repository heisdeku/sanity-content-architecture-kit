import { ArticleCard } from "@/features/articles/article-card";
import { Heading } from "@/features/page-builder/heading";
import { Section } from "@/features/page-builder/section";
import type { ArticleListSection } from "@/features/sanity/types";

export function ArticleList({ section }: { section: ArticleListSection }) {
  const articles = section.articles ?? [];
  return (
    <Section type={section._type} width="wide">
      <Heading heading={section.heading} className="mb-10" />
      {articles.length === 0 ? (
        <p className="text-muted">No articles yet.</p>
      ) : (
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <li key={article._id}>
              <ArticleCard article={article} />
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
