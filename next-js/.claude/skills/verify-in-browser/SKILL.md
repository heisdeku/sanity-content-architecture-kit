---
name: verify-in-browser
description: Run the dev server and verify a change in a real browser and with curl, including agent behaviour (markdown negotiation, 404s, llms.txt). Use after any visible or routing change.
---

# Verify in browser

## Steps

1. Static gates first: `npm run check && npm run typecheck`.
2. Start the server in the background: `npm run dev` (port 3000). Use the
   `next-devtools` MCP server from `.mcp.json` if available; otherwise the
   Chrome DevTools MCP or plain curl.
3. Open the changed route in the browser. Check light and dark schemes,
   a 375px viewport, keyboard focus rings, and that no image lacks a
   reserved box (no layout shift).
4. Agent checks with curl:

```
curl -s -o /dev/null -w '%{http_code}\n' localhost:3000/
curl -s -H 'Accept: text/markdown' localhost:3000/ | head
curl -s -o /dev/null -w '%{http_code}\n' localhost:3000/does-not-exist
curl -s -i localhost:3000/llms.txt | head -3
curl -s localhost:3000/robots.txt
curl -s localhost:3000/openapi.json | head -c 200
```

5. Draft mode: open `/api/draft-mode/enable?sanity-preview-secret=...` from
   the Studio Presentation tool and confirm the banner renders and drafts show.
6. Stop the server when done.

## What "good" looks like

- Unknown paths return a real 404 status, and Markdown for markdown clients.
- No `500` for missing content: routes render an empty state instead.
- `npm run build` passes with `.env.example` values and no network.
