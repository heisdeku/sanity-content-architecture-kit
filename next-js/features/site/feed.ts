import { publishedFetch, safe } from "@/features/sanity/fetch";
import { typeTag } from "@/features/sanity/tags";
import { DEFAULT_SITE_NAME } from "@/features/site/metadata";
import { absoluteUrl, siteOrigin } from "@/features/utils/absolute-url";
import { FEED_QUERY } from "@/sanity/queries/documents/sitemap";

function escapeXml(value: string) {
  return value.replace(
    /[<>&'"]/g,
    (c) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        "'": "&apos;",
        '"': "&quot;",
      })[c] ?? c,
  );
}

/** RSS 2.0 feed of published articles. Empty channel on failure. */
export async function buildFeed(
  site: { name?: string | null; tagline?: string | null } | null,
): Promise<string> {
  const { data } = await safe(
    publishedFetch({ query: FEED_QUERY, tags: [typeTag("article")] }),
  );
  const title = escapeXml(site?.name ?? DEFAULT_SITE_NAME);
  const items = (data ?? [])
    .map((article) => {
      const url = absoluteUrl(article.path);
      return [
        "<item>",
        `<title>${escapeXml(article.title ?? "Untitled")}</title>`,
        `<link>${url}</link>`,
        `<guid isPermaLink="true">${url}</guid>`,
        article.publishedAt
          ? `<pubDate>${new Date(article.publishedAt).toUTCString()}</pubDate>`
          : "",
        article.author
          ? `<dc:creator>${escapeXml(article.author)}</dc:creator>`
          : "",
        article.excerpt
          ? `<description>${escapeXml(article.excerpt)}</description>`
          : "",
        "</item>",
      ]
        .filter(Boolean)
        .join("");
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
<channel>
<title>${title}</title>
<link>${siteOrigin()}</link>
<atom:link href="${absoluteUrl("/feed.xml")}" rel="self" type="application/rss+xml"/>
<description>${escapeXml(site?.tagline ?? `Articles from ${site?.name ?? DEFAULT_SITE_NAME}`)}</description>
<language>en</language>
${items}
</channel>
</rss>
`;
}
