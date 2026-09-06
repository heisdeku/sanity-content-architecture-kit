/**
 * robots.txt policy. Search and citation bots are allowed; training bots are
 * not. `Content-Signal` is the Cloudflare/IETF draft line, which Next's
 * MetadataRoute.Robots cannot emit, so this is written by hand.
 */
export const TRAINING_BOTS = [
  "GPTBot",
  "Google-Extended",
  "CCBot",
  "ClaudeBot",
  "anthropic-ai",
  "Applebot-Extended",
  "Bytespider",
  "Meta-ExternalAgent",
  "cohere-ai",
  "Omgilibot",
  "Diffbot",
];

export function buildRobotsTxt(origin: string): string {
  const lines = [
    "# Search engines and citation crawlers are welcome. Training crawlers are not.",
    "Content-Signal: search=yes, ai-train=no, use=reference",
    "",
    "User-agent: *",
    "Allow: /",
    "Disallow: /api/",
    "Disallow: /studio",
    "",
  ];
  for (const bot of TRAINING_BOTS)
    lines.push(`User-agent: ${bot}`, "Disallow: /", "");
  lines.push(`Sitemap: ${origin}/sitemap.xml`);
  return `${lines.join("\n")}\n`;
}
