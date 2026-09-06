# Seed dataset

`seed.ndjson` is a small, realistic dataset for a fresh project:

| id | type | route |
|----|------|-------|
| `site` | site | global config: navigation, SEO defaults, two redirects, llms.txt, 404 content, notification recipients |
| `homepage` | homepage | `/` |
| `page-about`, `page-services`, `page-contact` | page | `/about`, `/services`, `/contact` (contact form section) |
| `article-designing-content-models`, `article-closed-section-set` | article | `/articles/<slug>` |
| `category-architecture`, `category-editorial` | category | none |
| `legal-privacy-policy`, `legal-terms-of-service` | legalPage | `/legal/<slug>` |

Ids are deterministic so the seed can be re-imported and so the singletons
land on their fixed ids (`homepage`, `site`).

## No assets

NDJSON import cannot reference remote image URLs, so the seed contains **no
image, video, Lottie or Rive assets**. Sections that require media (`sectionMedia`,
`sectionImageText`, `sectionLogoGrid`) and the hero media are therefore not
part of the seed. Upload a few images in the Studio after importing and add
them where you like; every other section and field is populated.

## Import

The setup script imports the seed as its last step:

```sh
npm run sanity:project-setup
```

To import by hand (replaces documents with the same ids, keeps everything else):

```sh
npx sanity dataset import seed/seed.ndjson production --replace
```

To start from an empty dataset first:

```sh
npx sanity dataset delete production && npx sanity dataset create production --visibility public
npx sanity dataset import seed/seed.ndjson production
```

## Editing the seed

Keep one JSON document per line. Every array item needs a `_key`, every
Portable Text block needs `_key`s on the block and its spans, and references
must point at ids that exist in the file.
