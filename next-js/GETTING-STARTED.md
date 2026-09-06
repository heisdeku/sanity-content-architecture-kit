# Getting started

From a fresh clone to a rendered section in about ten minutes.

## 1. Install

```bash
cd next-js
nvm use            # Node 24, from .nvmrc
npm install        # also installs git hooks through lefthook
```

## 2. Configure env

```bash
cp .env.example .env
```

The placeholder Sanity id in `.env.example` is enough for `npm run build` and
`npm run dev` to start: pages render an empty "Connect Sanity" state until a
real project exists.

## 3. Create the Sanity project

```bash
npm run sanity:project-setup
```

The script logs you in to Sanity, creates a project and dataset, mints a
viewer and an editor token, adds `http://localhost:3000` to CORS origins,
registers the revalidate webhook, writes the values into `.env`, and imports
the seed dataset from `seed/`. Answer the prompts; defaults are sensible.

If you prefer to do this by hand, the values you need are listed in
`.env.example`, and the webhook projection is documented in
`docs/features/fetch-layer.md`.

## 4. Run

```bash
npm run dev
```

- `http://localhost:3000` is the site, rendering the seeded homepage.
- `http://localhost:3000/studio` is the Studio, embedded in the app.

## 5. Edit a section

1. Open the Studio, choose Homepage, and change the hero heading.
2. Open the Presentation tool to see the draft update live.
3. Publish. The webhook busts the `doc:homepage` tag and the public page
   updates on the next request.

## 6. Add a section

```bash
npm run plop section Testimonials
```

This creates the schema file, registers it, adds the GROQ projection, creates
the React component and registers it in the page builder. Then:

```bash
npm run sanity:typegen
npm run check && npm run typecheck
```

Edit the generated files to taste. See `docs/features/scaffolding.md`.

## 7. Verify before you commit

```bash
npm run check
npm run typecheck
npm run build
```

Hooks run Biome on staged files and commitlint on the message.

## Where to next

- `AGENTS.md`: the rules of the codebase
- `docs/features/`: one document per feature
- `../docs/architecture.md`: the spec both editions follow
