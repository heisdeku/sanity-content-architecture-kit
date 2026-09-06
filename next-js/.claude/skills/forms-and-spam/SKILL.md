---
name: forms-and-spam
description: Add or change a form that posts to an API route with honeypot, timing token and rate limit protection. Use when building any user-submitted form.
---

# Forms and spam prevention

Read `docs/features/forms.md` first.

## Steps

1. Define the zod schema in `features/forms/<name>-schema.ts`. Always include
   `_hp: z.string().max(0).optional().default("")` and `_t: z.string().min(1)`.
2. Build the client form with `useForm` + `zodResolver` and the primitives in
   `features/forms/form-primitives.tsx` (`Form.Field`, `Form.Label`,
   `Form.Control`, `Form.Error`, `Form.Status`, `Form.Submit`). Render
   `<Honeypot {...register("_hp")} />` from `features/spam-prevention/honeypot.tsx`.
3. Create the timing token on the server where the form is rendered:
   `createTimingToken()` from `features/spam-prevention/timing-token.ts`
   (server-only), pass it as a prop.
4. Write the server logic in `features/forms/submit-<name>.ts` following
   `submit-contact.ts`: `rateLimit`, JSON parse, `schema.safeParse`,
   honeypot, `verifyTimingToken`, then the sink. Return `{ ok }` or
   `{ ok: false, status, body: ApiError }`.
5. Add the route in `app/api/<name>/route.ts`; keep it under ten lines and
   use `apiError` / `apiOk` from `features/utils/api-error.ts`.
6. Document the request body in `features/agents/openapi.ts`.

## Verify

```
curl -X POST localhost:3000/api/<name> -H 'content-type: application/json' -d '{"_hp":"bot"}'
# expect 400 { "error": "Rejected", "code": "spam_detected" }
```
