/**
 * Generators: section, route, feature. Run `npm run plop <generator> <Name>`.
 *
 * The section generator edits files it does not own (sanity/**) with regex
 * anchors on the shapes those files already have. The anchors it relies on
 * are documented in docs/features/scaffolding.md; if the sanity files change
 * shape, update the patterns here.
 */
export default function (plop) {
  plop.setHelper(
    "sectionType",
    (name) => `section${plop.getHelper("pascalCase")(name)}`,
  );

  plop.setGenerator("section", {
    description:
      "New page-builder section: schema, registry, projection, component, renderer",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Section name (e.g. Testimonials)",
      },
    ],
    actions: [
      {
        type: "add",
        path: "sanity/schemas/sections/section-{{kebabCase name}}.ts",
        templateFile: "templates/section/schema.ts.hbs",
      },
      {
        type: "modify",
        path: "sanity/schemas/index-registry.ts",
        pattern:
          /(import \{ sectionRichText \} from '\.\/sections\/section-rich-text'\n)/,
        template:
          "$1import { {{sectionType name}} } from './sections/section-{{kebabCase name}}'\n",
      },
      {
        type: "modify",
        path: "sanity/schemas/index-registry.ts",
        pattern: /( {2}sectionMedia,\n)/,
        template: "$1  {{sectionType name}},\n",
      },
      {
        type: "modify",
        path: "sanity/config/constants.ts",
        pattern: /( {2}'sectionMedia',\n)/,
        template: "$1  '{{sectionType name}}',\n",
      },
      {
        type: "modify",
        path: "sanity/queries/fragments/sections.ts",
        pattern: /( {2}sectionMedia: \/\* groq \*\/ `\{[\s\S]*?\n {2}`,\n)/,
        templateFile: "templates/section/projection.groq.hbs",
      },
      {
        type: "add",
        path: "features/page-builder/sections/{{kebabCase name}}.tsx",
        templateFile: "templates/section/component.tsx.hbs",
      },
      {
        type: "modify",
        path: "features/sanity/types.ts",
        pattern: /(export type MediaSection = SectionOf<"sectionMedia">;\n)/,
        template:
          '$1export type {{pascalCase name}}Section = SectionOf<"{{sectionType name}}">;\n',
      },
      {
        type: "modify",
        path: "features/page-builder/page-builder.tsx",
        pattern: /(\/\/ plop:page-builder-import\n)/,
        template:
          'import { {{pascalCase name}} } from "@/features/page-builder/sections/{{kebabCase name}}";\n$1',
      },
      {
        type: "modify",
        path: "features/page-builder/page-builder.tsx",
        pattern: /( {4}\/\/ plop:page-builder-case\n)/,
        template:
          '    case "{{sectionType name}}":\n      return <{{pascalCase name}} section={section} />;\n$1',
      },
      () =>
        [
          "Next steps:",
          "  1. Edit the schema and projection, then `npm run sanity:typegen`.",
          "  2. `npm run check && npm run typecheck`.",
          "  3. The Markdown serializer needs no change if the section uses factories.",
        ].join("\n"),
    ],
  });

  plop.setGenerator("route", {
    description: "New App Router page that fetches from Sanity",
    prompts: [
      {
        type: "input",
        name: "path",
        message: "Route path (e.g. work or work/[slug])",
      },
      {
        type: "input",
        name: "query",
        message: "Query constant (e.g. PAGE_BY_URI_QUERY)",
        default: "PAGE_BY_URI_QUERY",
      },
      {
        type: "input",
        name: "queryFile",
        message: "Query file under sanity/queries/documents",
        default: "page",
      },
    ],
    actions: [
      {
        type: "add",
        path: "app/{{path}}/page.tsx",
        templateFile: "templates/route/page.tsx.hbs",
      },
      () =>
        "Add the route to SITEMAP_QUERY, AGENT_INVENTORY_QUERY and features/agents/openapi.ts if it is public.",
    ],
  });

  plop.setGenerator("feature", {
    description: "New feature module folder with a component and a helper",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Feature name (e.g. newsletter)",
      },
    ],
    actions: [
      {
        type: "add",
        path: "features/{{kebabCase name}}/{{kebabCase name}}.tsx",
        templateFile: "templates/feature/component.tsx.hbs",
      },
      {
        type: "add",
        path: "docs/features/{{kebabCase name}}.md",
        templateFile: "templates/feature/doc.md.hbs",
      },
    ],
  });
}
