# Getting started (Astro edition)

## 1. Install

```bash
cd astro
nvm use            # Node 24
cp .env.example .env
npm install        # also installs lefthook hooks
```

## 2. Create the Sanity project

```bash
npm run sanity:project-setup
```

The script is interactive. It creates a project and dataset with `@sanity/cli`,
mints a viewer and an editor token, adds CORS origins for `PUBLIC_URL`,
registers the revalidate webhook (`/api/revalidate` with the GROQ projection
`{ _type, _id, "uri": coalesce(uri.current, slug.current) }`), writes `.env`
and imports `seed/`. If you already have a project, fill `.env` by hand
instead: `PUBLIC_SANITY_PROJECT_ID`, `PUBLIC_SANITY_DATASET`, the two tokens
and `SANITY_REVALIDATE_SECRET`.

For the llms.txt generator, deploy the schema once so Agent Actions can read it:

```bash
npx sanity schema deploy
```

## 3. Run

```bash
npm run dev
```

- Site: http://localhost:4321
- Studio: http://localhost:4321/studio (add `http://localhost:4321` as a CORS
  origin with credentials in sanity.io/manage if the Studio asks)

Open the Site document, set the name and navigation, publish the Homepage and
the site renders it. Presentation previews drafts through `/api/draft-mode/enable`.

## 4. Verify

```bash
npm run check
npm run typecheck
npm run build
```

Then run through `.claude/skills/verify-in-browser/SKILL.md`.

## 5. Deploy

The adapter is `@astrojs/vercel` with `output: 'server'`. Set the same env
vars in Vercel. On Vercel the route cache uses the CDN
(`Vercel-CDN-Cache-Control`, `Vercel-Cache-Tag`) and the webhook purges tags
with `invalidateByTag`. Point the Sanity webhook at
`https://<your-domain>/api/revalidate`.

## Common tasks

- Add a section: `npm run plop section Testimonials` (see `.claude/skills/add-section`).
- Add a document type: `.claude/skills/add-document-type`.
- Regenerate types after schema changes: `npm run sanity:typegen`.
- Back up content: `npm run sanity:backup`.
