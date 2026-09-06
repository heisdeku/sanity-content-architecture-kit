/** OpenAPI 3.1 description of the public surface, built at request time. */
export type OpenApiInput = { siteName: string; origin: string };

const errorResponse = {
  description: "Error",
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/ErrorResponse" },
    },
  },
};

export function buildOpenApiDocument({ siteName, origin }: OpenApiInput) {
  return {
    openapi: "3.1.0",
    info: {
      title: `${siteName} public API`,
      version: "1.0.0",
      description:
        "Read-only surface for agents and crawlers. Pages answer in Markdown when the request prefers text/markdown.",
    },
    servers: [{ url: origin }],
    paths: {
      "/{path}": {
        get: {
          summary: "Any public page",
          description:
            "Send `Accept: text/markdown` to receive the page as Markdown on the same URL. Browsers get HTML.",
          parameters: [
            {
              name: "path",
              in: "path",
              required: true,
              schema: { type: "string" },
              description: "Page path",
            },
          ],
          responses: {
            "200": {
              description: "Page",
              content: {
                "text/html": { schema: { type: "string" } },
                "text/markdown": { schema: { type: "string" } },
              },
            },
            "401": { description: "Password protected" },
            "404": {
              description:
                "Unknown path. Markdown clients receive a recovery map.",
              content: { "text/markdown": { schema: { type: "string" } } },
            },
          },
        },
      },
      "/llms.txt": {
        get: {
          summary: "Site index for language models",
          responses: {
            "200": {
              description: "llms.txt",
              content: { "text/plain": { schema: { type: "string" } } },
            },
            "404": { description: "Not served" },
          },
        },
      },
      "/openapi.json": {
        get: {
          summary: "This document",
          responses: { "200": { description: "OpenAPI 3.1 JSON" } },
        },
      },
      "/sitemap.xml": {
        get: {
          summary: "Sitemap of indexable pages",
          responses: {
            "200": { description: "XML", content: { "application/xml": {} } },
          },
        },
      },
      "/robots.txt": {
        get: {
          summary: "Crawl policy including AI training directives",
          responses: {
            "200": { description: "text", content: { "text/plain": {} } },
          },
        },
      },
      "/feed.xml": {
        get: {
          summary: "RSS 2.0 feed of articles",
          responses: {
            "200": {
              description: "RSS",
              content: { "application/rss+xml": {} },
            },
          },
        },
      },
      "/api/contact": {
        post: {
          summary: "Submit the contact form",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ContactRequest" },
              },
            },
          },
          responses: {
            "200": {
              description: "Stored",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: { ok: { type: "boolean", const: true } },
                  },
                },
              },
            },
            "400": errorResponse,
            "429": errorResponse,
            "500": errorResponse,
          },
        },
      },
    },
    components: {
      schemas: {
        ErrorResponse: {
          type: "object",
          required: ["error", "code"],
          properties: {
            error: { type: "string" },
            code: { type: "string" },
            hint: { type: "string" },
          },
        },
        ContactRequest: {
          type: "object",
          required: ["name", "email", "message", "_t"],
          properties: {
            name: { type: "string", minLength: 2 },
            email: { type: "string", format: "email" },
            message: { type: "string", minLength: 10 },
            page: { type: "string" },
            _t: {
              type: "string",
              description: "Timing token rendered into the form",
            },
            _hp: { type: "string", description: "Honeypot, must be empty" },
          },
        },
      },
    },
  } as const;
}
