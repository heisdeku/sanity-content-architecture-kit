/**
 * True when the Accept header prefers text/markdown over text/html.
 *
 * Browsers never mention markdown, so the `includes` check fails fast and the
 * request continues down the HTML path with no parsing cost. Only agent
 * requests pay for the q-value comparison.
 */
export function acceptsMarkdown(accept: string | null | undefined): boolean {
  if (!accept || !accept.includes("markdown")) return false;

  let markdown = -1;
  let html = -1;
  let wildcard = -1;

  for (const part of accept.split(",")) {
    const [rawType, ...params] = part.trim().split(";");
    const type = rawType?.trim().toLowerCase();
    if (!type) continue;
    let q = 1;
    for (const param of params) {
      const [key, value] = param.trim().split("=");
      if (key?.trim() === "q" && value) {
        const parsed = Number.parseFloat(value);
        if (!Number.isNaN(parsed)) q = parsed;
      }
    }
    if (type === "text/markdown" || type === "text/x-markdown")
      markdown = Math.max(markdown, q);
    else if (type === "text/html") html = Math.max(html, q);
    else if (type === "*/*" || type === "text/*")
      wildcard = Math.max(wildcard, q);
  }

  if (markdown <= 0) return false;
  const htmlScore = html >= 0 ? html : wildcard;
  return markdown >= htmlScore;
}
