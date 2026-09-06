import { absoluteUrl } from '@/features/utils/absolute-url';

export type NotFoundEntry = { title: string; path: string };

/**
 * The Markdown recovery map an agent receives instead of a 404 HTML shell.
 * It points at the discovery surfaces and the top pages so the agent can
 * recover without guessing URLs.
 */
export function notFoundMarkdown({
  siteName,
  baseUrl,
  requestedPath,
  pages,
  llmsTxtEnabled,
  intro,
}: {
  siteName: string;
  baseUrl: string;
  requestedPath: string;
  pages: NotFoundEntry[];
  llmsTxtEnabled: boolean;
  /** Overrides the first paragraph (default: no document at this path). */
  intro?: string;
}): string {
  const lines = [
    `# ${siteName}: ${intro ? 'content unavailable' : 'page not found'}`,
    '',
    intro ?? `No document is routed at \`${requestedPath}\`.`,
    '',
    '## Discovery',
    '',
    ...(llmsTxtEnabled
      ? [`- [llms.txt](${absoluteUrl('/llms.txt', baseUrl)}): curated index of this site`]
      : []),
    `- [sitemap.xml](${absoluteUrl('/sitemap.xml', baseUrl)}): every indexable URL`,
    `- [openapi.json](${absoluteUrl('/openapi.json', baseUrl)}): machine-readable description of this site's endpoints`,
    '',
    'Every page also answers in Markdown when requested with `Accept: text/markdown`.',
  ];
  if (pages.length > 0) {
    lines.push('', '## Top pages', '');
    for (const page of pages) lines.push(`- [${page.title}](${absoluteUrl(page.path, baseUrl)})`);
  }
  return `${lines.join('\n')}\n`;
}
