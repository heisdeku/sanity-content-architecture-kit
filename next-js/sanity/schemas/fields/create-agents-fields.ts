import { defineField } from "sanity";
import { GenerateLlmsTxtInput } from "../../components/generate-llms-txt-input";
import { GenerateMarkdownInput } from "../../components/generate-markdown-input";

export type AgentsFieldsOptions = {
  group?: string;
  /** `site` holds llms.txt, `document` holds per-page Markdown. */
  variant?: "document" | "site";
};

/**
 * Agent-facing fields, grouped under `agents`.
 *
 * - documents: `agents.serveMarkdown` (default true) and `agents.markdown`,
 *   the stored Markdown served when a client prefers `text/markdown`.
 * - site: `agents.serveLlmsTxt`, `agents.llmsTxtGuidance` and
 *   `agents.llmsTxt`, served verbatim at `/llms.txt`.
 *
 * Both text fields have a Generate button that calls the app.
 */
export function createAgentsFields({
  group,
  variant = "document",
}: AgentsFieldsOptions = {}) {
  if (variant === "site") {
    return [
      defineField({
        name: "agents",
        title: "Agents",
        type: "object",
        group,
        options: { collapsible: false },
        fields: [
          defineField({
            name: "serveLlmsTxt",
            title: "Serve llms.txt",
            type: "boolean",
            description: "Publish the text below at /llms.txt",
            initialValue: false,
          }),
          defineField({
            name: "llmsTxtGuidance",
            title: "Generation guidance",
            type: "text",
            rows: 4,
            description: "Instructions for the generator, e.g. tone or focus",
          }),
          defineField({
            name: "llmsTxt",
            title: "llms.txt",
            type: "text",
            rows: 16,
            description: "Served verbatim. Generate, then edit as needed",
            components: { input: GenerateLlmsTxtInput },
          }),
        ],
      }),
    ];
  }

  return [
    defineField({
      name: "agents",
      title: "Agents",
      type: "object",
      group,
      options: { collapsible: false },
      fields: [
        defineField({
          name: "serveMarkdown",
          title: "Serve Markdown to agents",
          type: "boolean",
          description: "Return the Markdown below when a client asks for it",
          initialValue: true,
        }),
        defineField({
          name: "markdown",
          title: "Markdown",
          type: "text",
          rows: 16,
          description: "Served verbatim. Generate after editing the page",
          components: { input: GenerateMarkdownInput },
        }),
      ],
    }),
  ];
}
