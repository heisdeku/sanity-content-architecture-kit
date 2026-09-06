/**
 * True when the Accept header prefers text/markdown over text/html.
 * Browsers send "text/html,..." so the first-character check short-circuits
 * them before any parsing; only agent requests pay for the full parse.
 */
export function acceptsMarkdown(accept: string | null | undefined): boolean {
  if (!accept) return false;
  const trimmed = accept.trimStart();
  if (trimmed.startsWith('text/html') || trimmed.startsWith('*/*')) return false;
  if (!trimmed.includes('markdown')) return false;

  let markdownQ = -1;
  let htmlQ = -1;
  for (const part of trimmed.split(',')) {
    const [rawType, ...params] = part.split(';');
    const type = rawType?.trim().toLowerCase();
    if (!type) continue;
    let q = 1;
    for (const param of params) {
      const [key, value] = param.split('=');
      if (key?.trim() === 'q' && value) q = Number.parseFloat(value) || 0;
    }
    if (type === 'text/markdown' || type === 'text/x-markdown') markdownQ = Math.max(markdownQ, q);
    if (type === 'text/html') htmlQ = Math.max(htmlQ, q);
  }
  return markdownQ > 0 && markdownQ >= htmlQ;
}
