export type NotFoundPage = { title: string; url: string };

export type NotFoundMarkdownInput = {
  origin: string;
  path?: string | null;
  siteName?: string | null;
  topPages?: NotFoundPage[];
};

/** Markdown recovery map for agents that hit an unknown path. */
export function notFoundMarkdown({
  origin,
  path,
  siteName,
  topPages = [],
}: NotFoundMarkdownInput): string {
  const lines = [
    `# Not found${siteName ? ` on ${siteName}` : ""}`,
    "",
    path
      ? `There is no page at \`${path}\`.`
      : "There is no page at this path.",
    "",
    "## Where to look instead",
    "",
    `- [llms.txt](${origin}/llms.txt): index of every page with a short description`,
    `- [sitemap.xml](${origin}/sitemap.xml): every indexable URL`,
    `- [openapi.json](${origin}/openapi.json): how this site answers requests`,
    "",
    "Any page URL answers in Markdown when the request sends `Accept: text/markdown`.",
  ];

  if (topPages.length > 0) {
    lines.push("", "## Top pages", "");
    for (const page of topPages) lines.push(`- [${page.title}](${page.url})`);
  }

  return `${lines.join("\n")}\n`;
}
