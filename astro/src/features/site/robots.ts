/**
 * robots.txt policy (spec section 7): search and citation bots are welcome,
 * training-only crawlers are not, and the Content-Signal line states the
 * same preference in the emerging machine-readable form.
 */
const TRAINING_BOTS = [
  'GPTBot',
  'Google-Extended',
  'CCBot',
  'ClaudeBot',
  'anthropic-ai',
  'Applebot-Extended',
  'Bytespider',
  'Diffbot',
  'FacebookBot',
  'ImagesiftBot',
  'Meta-ExternalAgent',
  'Omgilibot',
  'Amazonbot',
  'cohere-ai',
  'PerplexityBot',
  'YouBot',
];

export function buildRobotsTxt({ baseUrl }: { baseUrl: string }): string {
  const lines = [
    'Content-Signal: search=yes, ai-train=no, use=reference',
    '',
    'User-agent: *',
    'Allow: /',
    'Disallow: /api/',
    'Disallow: /studio',
    '',
  ];
  for (const bot of TRAINING_BOTS) lines.push(`User-agent: ${bot}`, 'Disallow: /', '');
  lines.push(`Sitemap: ${baseUrl.replace(/\/$/, '')}/sitemap.xml`);
  return `${lines.join('\n')}\n`;
}
