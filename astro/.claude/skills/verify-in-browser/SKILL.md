---
name: verify-in-browser
description: How to verify the Astro edition end to end (lint, types, build, dev server, curl checks, Studio). Use before declaring any change done.
---

# Verify

From `astro/` with `.env` present:

```
npm run check       # biome, writes fixes
npm run typecheck   # astro check
npm run build       # must pass with placeholder Sanity ids (no network required)
```

Then start `npm run dev` and check:

```
curl -si localhost:4321/ | head -20                      # 200, Vary: Cookie, Authorization, Accept
curl -si localhost:4321/does-not-exist | head -1         # 404
curl -si -H "Accept: text/markdown" localhost:4321/      # text/markdown (200, 404 map, or 503 map when Sanity is unreachable)
curl -s localhost:4321/robots.txt
curl -s localhost:4321/openapi.json | head -c 200
curl -si localhost:4321/llms.txt | head -1               # 404 unless site.agents.serveLlmsTxt
curl -si localhost:4321/studio | head -1                 # 200 HTML
```

In the browser (chrome-devtools MCP is configured in `.mcp.json`): open `/`, `/studio`, add
content, publish, confirm the page updates after the webhook fires. Check the console for
hydration warnings on islands.
