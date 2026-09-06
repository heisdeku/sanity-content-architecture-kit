// Plop generators: section, route, feature. See docs/features/scaffolding.md.
// The `modify` actions match the exact shapes in the shared sanity/ folder and
// in src/features/page-builder/page-builder.astro; if one of those files is
// reshaped, update the pattern here in the same change.

const GROQ_PROJECTION = [
  '  {{sectionType name}}: /* groq */ `{',
  '    "heading": heading${HEADING_FRAGMENT},',
  '    "body": body[]${RICH_TEXT_FRAGMENT}',
  '  }`,',
].join('\n');

/** @param {import('plop').NodePlopAPI} plop */
export default function configure(plop) {
  plop.setHelper('sectionType', (name) => `section${plop.getHelper('pascalCase')(name)}`);

  plop.setGenerator('section', {
    description: 'Page builder section: schema, registry, constant, GROQ projection, renderer',
    prompts: [
      { type: 'input', name: 'name', message: 'Section name (e.g. Testimonials)' },
      {
        type: 'input',
        name: 'title',
        message: 'Studio title',
        default: (answers) => plop.getHelper('titleCase')(answers.name),
      },
    ],
    actions: [
      {
        type: 'add',
        path: 'sanity/schemas/sections/section-{{kebabCase name}}.ts',
        templateFile: 'templates/section/schema.ts.hbs',
      },
      {
        type: 'modify',
        path: 'sanity/schemas/index-registry.ts',
        pattern: /(import \{ sectionRichText \} from '\.\/sections\/section-rich-text')/,
        template:
          "$1\nimport { section{{pascalCase name}} } from './sections/section-{{kebabCase name}}'",
      },
      {
        type: 'modify',
        path: 'sanity/schemas/index-registry.ts',
        pattern: /(\n\s*sectionRichText,)/,
        template: '$1\n  section{{pascalCase name}},',
      },
      {
        type: 'modify',
        path: 'sanity/config/constants.ts',
        pattern: /(export const SECTION_TYPES = \[[\s\S]*?)(\n\] as const)/,
        template: "$1\n  '{{sectionType name}}',$2",
      },
      {
        type: 'modify',
        path: 'sanity/queries/fragments/sections.ts',
        pattern: /(export const SECTION_PROJECTIONS: Record<string, string> = \{[\s\S]*?)(\n\}\n)/,
        template: `$1\n${GROQ_PROJECTION}$2`,
      },
      {
        type: 'add',
        path: 'src/features/page-builder/sections/{{kebabCase name}}.astro',
        templateFile: 'templates/section/section.astro.hbs',
      },
      {
        type: 'modify',
        path: 'src/features/page-builder/page-builder.astro',
        pattern: /(import RichText from '\.\/sections\/rich-text\.astro';)/,
        template: "$1\nimport {{pascalCase name}} from './sections/{{kebabCase name}}.astro';",
      },
      {
        type: 'modify',
        path: 'src/features/page-builder/page-builder.astro',
        pattern: /(\s*\/\/ plop:section-renderer)/,
        template: '\n  {{sectionType name}}: {{pascalCase name}},$1',
      },
      () =>
        'Next: npm run sanity:typegen, then npm run check && npm run typecheck. Factory fields serialize to Markdown automatically.',
    ],
  });

  plop.setGenerator('route', {
    description: 'Astro page or endpoint under src/pages',
    prompts: [
      { type: 'list', name: 'kind', message: 'Kind', choices: ['page', 'endpoint'] },
      {
        type: 'input',
        name: 'path',
        message: 'Route path without extension (e.g. team or api/ping)',
      },
    ],
    actions: (answers) =>
      answers?.kind === 'page'
        ? [
            {
              type: 'add',
              path: 'src/pages/{{path}}.astro',
              templateFile: 'templates/route/page.astro.hbs',
            },
          ]
        : [
            {
              type: 'add',
              path: 'src/pages/{{path}}.ts',
              templateFile: 'templates/route/endpoint.ts.hbs',
            },
          ],
  });

  plop.setGenerator('feature', {
    description: 'Feature module under src/features',
    prompts: [{ type: 'input', name: 'name', message: 'Feature name (kebab-case)' }],
    actions: [
      {
        type: 'add',
        path: 'src/features/{{kebabCase name}}/{{kebabCase name}}.ts',
        templateFile: 'templates/feature/module.ts.hbs',
      },
      {
        type: 'add',
        path: 'src/features/{{kebabCase name}}/{{kebabCase name}}.astro',
        templateFile: 'templates/feature/component.astro.hbs',
      },
      {
        type: 'add',
        path: 'docs/features/{{kebabCase name}}.md',
        templateFile: 'templates/feature/doc.md.hbs',
      },
    ],
  });
}
