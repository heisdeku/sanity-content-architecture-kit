/**
 * OpenAPI 3.1 document for the public surface of the site: Markdown
 * negotiation on every page, llms.txt, sitemap, robots, feed and the contact
 * endpoint. Built from site.name so it never drifts from the CMS.
 */
export function buildOpenApiDocument({
  siteName,
  baseUrl,
  llmsTxtEnabled,
}: {
  siteName: string;
  baseUrl: string;
  llmsTxtEnabled: boolean;
}) {
  const errorRef = { $ref: '#/components/schemas/ErrorResponse' };
  const errorResponse = (description: string) => ({
    description,
    content: { 'application/json': { schema: errorRef } },
  });

  return {
    openapi: '3.1.0',
    info: {
      title: siteName,
      version: '1.0.0',
      description: `Public content API of ${siteName}. Pages answer in HTML or Markdown depending on the Accept header.`,
    },
    servers: [{ url: baseUrl }],
    paths: {
      '/{path}': {
        get: {
          operationId: 'getPage',
          summary: 'A page, in HTML or Markdown',
          description:
            'Send `Accept: text/markdown` to receive the editor-approved Markdown version of the page. Browsers get HTML. Unknown paths return 404 with a Markdown recovery map when Markdown was requested.',
          parameters: [
            {
              name: 'path',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'Page path without a leading slash',
            },
            {
              name: 'Accept',
              in: 'header',
              required: false,
              schema: { type: 'string', enum: ['text/html', 'text/markdown'] },
            },
          ],
          responses: {
            '200': {
              description: 'The page',
              content: {
                'text/html': { schema: { type: 'string' } },
                'text/markdown': { schema: { type: 'string' } },
              },
            },
            '404': {
              description: 'No document at this path',
              content: { 'text/markdown': { schema: { type: 'string' } } },
            },
          },
        },
      },
      ...(llmsTxtEnabled
        ? {
            '/llms.txt': {
              get: {
                operationId: 'getLlmsTxt',
                summary: 'Curated index of the site for agents',
                responses: {
                  '200': {
                    description: 'llms.txt',
                    content: { 'text/plain': { schema: { type: 'string' } } },
                  },
                  '404': { description: 'Not served' },
                },
              },
            },
          }
        : {}),
      '/openapi.json': {
        get: {
          operationId: 'getOpenApi',
          summary: 'This document',
          responses: {
            '200': {
              description: 'OpenAPI 3.1 document',
              content: { 'application/json': { schema: { type: 'object' } } },
            },
          },
        },
      },
      '/sitemap.xml': {
        get: {
          operationId: 'getSitemap',
          summary: 'Sitemap of indexable pages',
          responses: {
            '200': {
              description: 'XML sitemap',
              content: { 'application/xml': { schema: { type: 'string' } } },
            },
          },
        },
      },
      '/robots.txt': {
        get: {
          operationId: 'getRobots',
          summary: 'Crawling policy',
          responses: {
            '200': {
              description: 'robots.txt',
              content: { 'text/plain': { schema: { type: 'string' } } },
            },
          },
        },
      },
      '/feed.xml': {
        get: {
          operationId: 'getFeed',
          summary: 'RSS 2.0 feed of articles',
          responses: {
            '200': {
              description: 'RSS feed',
              content: { 'application/rss+xml': { schema: { type: 'string' } } },
            },
          },
        },
      },
      '/api/contact': {
        post: {
          operationId: 'submitContact',
          summary: 'Submit the contact form',
          description:
            'Requires the timing token issued with the rendered form, so this endpoint is meant for the site UI rather than direct automation.',
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ContactRequest' } },
            },
          },
          responses: {
            '200': {
              description: 'Stored',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: { ok: { type: 'boolean', const: true } },
                    required: ['ok'],
                  },
                },
              },
            },
            '400': errorResponse('Validation failed or spam detected'),
            '429': errorResponse('Rate limited'),
            '500': errorResponse('Storage failure'),
          },
        },
      },
    },
    components: {
      schemas: {
        ErrorResponse: {
          type: 'object',
          required: ['error', 'code'],
          properties: {
            error: { type: 'string', description: 'Human readable message' },
            code: { type: 'string', description: 'Stable machine readable code' },
            hint: { type: 'string', description: 'How to recover' },
          },
        },
        ContactRequest: {
          type: 'object',
          required: ['name', 'email', 'message', '_t'],
          properties: {
            name: { type: 'string', minLength: 2, maxLength: 120 },
            email: { type: 'string', format: 'email' },
            message: { type: 'string', minLength: 10, maxLength: 5000 },
            page: { type: 'string', description: 'Path the form was submitted from' },
            _t: { type: 'string', description: 'Timing token from the rendered form' },
            _hp: { type: 'string', maxLength: 0, description: 'Honeypot, must be empty' },
          },
        },
      },
    },
  } as const;
}
