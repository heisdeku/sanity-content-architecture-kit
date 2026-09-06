# Contact form and spam prevention

One zod schema shared by the client form and the API route, three layers of
spam prevention, storage in Sanity, notification through Resend.

## Flow

1. The section renders `ContactForm` with a timing token created on the
   server (`features/spam-prevention/timing-token.ts`, HMAC-SHA256 of the
   render timestamp with `FORM_SECRET`).
2. The client validates with react-hook-form + `zodResolver(contactSchema)`.
   Errors are announced through `aria-describedby` and a polite live region.
3. `POST /api/contact` runs `features/forms/submit-contact.ts`:
   rate limit (5 per minute per IP, in memory), JSON parse, schema parse,
   honeypot check (`_hp` must be empty), timing token check (reject under
   3 seconds or over 24 hours), then the sink.
4. The sink (`features/forms/submission-sink.ts`) creates a `submission`
   document with the edit token and emails `site.notifications.recipients`
   from `RESEND_FROM`. With no `RESEND_API_KEY` the email step is skipped and
   logged; the submission is still stored.

## Error shape

Every failure uses `{ error, code, hint? }` from
`features/utils/api-error.ts`. Codes: `rate_limited`, `invalid_body`,
`spam_detected`, `validation_error`, `timing_invalid`, `timing_too_fast`,
`timing_expired`, `storage_failed`.

## Composition

`features/forms/form-primitives.tsx` exports `Form.Field`, `Form.Label`,
`Form.Control`, `Form.Error`, `Form.Status`, `Form.Submit`. A `Field`
provides ids and the error through context so the pieces compose without
prop drilling. Build other forms from the same primitives.

## Swapping the rate limiter

`rateLimit(key, { store })` accepts any `{ get, set }` store. The default is
per instance; pass a Redis or KV backed store for a global limit.
