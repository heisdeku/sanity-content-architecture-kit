---
name: forms-and-spam
description: Contact form, validation, honeypot, timing token, rate limit, submission storage and Resend email. Use when changing forms or /api/contact.
---

# Forms and spam prevention

- Schema: `src/features/forms/contact-schema.ts` (zod) is shared by the island and the API.
- Island: `contact-form.tsx` (react-hook-form + zodResolver, compound `Form.*` primitives from
  `form.tsx`, `aria-live` status). Mount it from a `.astro` section with `client:visible`
  and pass `token={createTimingToken(env.FORM_SECRET)}`.
- Spam: honeypot `_hp` must be empty; timing token `_t` is an HMAC of the render timestamp,
  rejected under 3 s or over 24 h; `rateLimit(clientKey(request))` is in-memory and pluggable.
- Server: `src/features/forms/submit-contact.ts` validates, stores a `submission` document
  with `writeClient`, emails `site.notifications.recipients` via Resend from `RESEND_FROM`.
  Without `RESEND_API_KEY` it still stores and logs.
- Errors use `apiError(status, code, message, hint)`; success is `{ ok: true }`.
- Test: `curl -X POST localhost:4321/api/contact -H 'content-type: application/json' -d '{"name":"x","email":"a@b.co","message":"hello there","_hp":"bot","_t":"x"}'` must return 400.
