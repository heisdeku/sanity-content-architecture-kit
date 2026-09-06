# Forms and spam prevention

Where: `src/features/forms/*`, `src/features/spam-prevention/*`, `src/pages/api/contact.ts`, `src/features/page-builder/sections/contact-form.astro`.

- `contact-schema.ts` (zod): `name`, `email`, `message`, `_hp` (honeypot, must be
  empty), `_t` (timing token), `page`. Shared by the island and the API.
- `contact-form.tsx` is a `client:visible` island using react-hook-form with
  `zodResolver` and the compound `Form.*` primitives in `form.tsx` (Root, Field,
  Label, Input, Textarea, Message, Status with `aria-live`, Submit).
- `timing-token.ts`: HMAC-SHA256 of the render timestamp with `FORM_SECRET`;
  rejected under 3 s (bots) or over 24 h (stale).
- `rate-limit.ts`: fixed window, 5 per 10 minutes per IP, in-memory store with a
  `RateLimitStore` interface to plug in Redis or KV.
- `submit-contact.ts`: validates, checks honeypot and timing, rate limits,
  creates a `submission` document with the editor token, then emails
  `site.notifications.recipients` via Resend from `RESEND_FROM` (falls back to
  `site.notifications.fromAddress`). Without `RESEND_API_KEY` it still stores and logs.
- Responses: `{ ok: true }` or `{ error, code, hint? }` with codes such as
  `validation-failed`, `spam-detected`, `timing-too-fast`, `rate-limited`,
  `missing-edit-token`, `storage-failed`.
