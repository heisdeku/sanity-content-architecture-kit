import { getPublishedInventory, topPages } from "@/features/agents/inventory";
import { notFoundMarkdown } from "@/features/agents/not-found-markdown";
import { publishedFetch, safe } from "@/features/sanity/fetch";
import { pathTag, typeTag } from "@/features/sanity/tags";
import { siteOrigin } from "@/features/utils/absolute-url";
import { MARKDOWN_BY_PATH_QUERY } from "@/sanity/queries/documents/agents";

export type MarkdownResponse = { status: number; body: string };

const MARKDOWN_TYPES = ["homepage", "page", "article", "legalPage"];

/** Recovery map for unknown or unavailable paths. */
export async function markdownNotFound(
  path: string,
  siteName?: string | null,
): Promise<MarkdownResponse> {
  const inventory = await getPublishedInventory();
  return {
    status: 404,
    body: notFoundMarkdown({
      origin: siteOrigin(),
      path,
      siteName,
      topPages: topPages(inventory),
    }),
  };
}

/**
 * Stored Markdown for a path, published perspective only. 404 with the
 * recovery map when the document is missing, protected or not serving.
 */
export async function getMarkdownForPath(
  path: string,
  siteName?: string | null,
): Promise<MarkdownResponse> {
  const { data } = await safe(
    publishedFetch({
      query: MARKDOWN_BY_PATH_QUERY,
      params: { path },
      tags: [pathTag(path), ...MARKDOWN_TYPES.map(typeTag)],
    }),
  );

  if (!data || data.passwordProtect) return markdownNotFound(path, siteName);
  if (!data.serveMarkdown || !data.markdown?.trim()) {
    return {
      status: 406,
      body: `# ${data.title ?? path}\n\nThis page is served as HTML only. Request it without \`Accept: text/markdown\`.\n`,
    };
  }
  return {
    status: 200,
    body: data.markdown.endsWith("\n") ? data.markdown : `${data.markdown}\n`,
  };
}
