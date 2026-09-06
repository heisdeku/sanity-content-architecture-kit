import { PageBuilder } from "@/features/page-builder/page-builder";
import { RichText } from "@/features/rich-text/rich-text";
import type { LegalPage as LegalPageValue } from "@/features/sanity/types";
import { formatDate } from "@/features/utils/format-date";

export function LegalPage({ page }: { page: LegalPageValue }) {
  return (
    <main>
      <article className="container-prose section-y">
        <p className="eyebrow">
          Legal
          {page.lastUpdated
            ? ` · Last updated ${formatDate(page.lastUpdated)}`
            : ""}
        </p>
        <h1 className="mt-4 mb-10 text-4xl font-semibold">{page.title}</h1>
        <RichText value={page.body} />
      </article>
      <PageBuilder sections={page.pageBuilder} />
    </main>
  );
}
