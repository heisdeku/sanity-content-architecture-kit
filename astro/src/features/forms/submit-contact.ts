import { env } from '@/env';
import { hasEditToken, writeClient } from '@/features/sanity/client';
import { clientKey, rateLimit } from '@/features/spam-prevention/rate-limit';
import { verifyTimingToken } from '@/features/spam-prevention/timing-token';
import { type ContactValues, contactSchema } from './contact-schema';

export type SubmitResult =
  | { ok: true; id: string }
  | { ok: false; status: number; code: string; error: string; hint?: string };

/**
 * Server side of the contact form: validate (same zod schema as the island),
 * honeypot, timing token, rate limit, then store a `submission` document and
 * email the recipients configured on the Site document.
 */
export async function submitContact({
  request,
  body,
  recipients,
  fromAddress,
}: {
  request: Request;
  body: unknown;
  recipients: string[];
  fromAddress?: string | null;
}): Promise<SubmitResult> {
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    const isHoneypot = first?.path[0] === '_hp';
    return {
      ok: false,
      status: 400,
      code: isHoneypot ? 'spam-detected' : 'validation-failed',
      error: isHoneypot ? 'Submission rejected' : (first?.message ?? 'Invalid submission'),
      hint: isHoneypot ? undefined : `Check the ${String(first?.path[0] ?? 'form')} field.`,
    };
  }
  const values = parsed.data;

  const timing = verifyTimingToken(values._t, env.FORM_SECRET);
  if (!timing.ok) {
    return {
      ok: false,
      status: 400,
      code: `timing-${timing.reason}`,
      error: 'Submission rejected',
      hint:
        timing.reason === 'expired'
          ? 'Reload the page and try again.'
          : 'Please take a moment before sending.',
    };
  }

  const limit = await rateLimit(clientKey(request));
  if (!limit.allowed) {
    return {
      ok: false,
      status: 429,
      code: 'rate-limited',
      error: 'Too many submissions',
      hint: `Try again in ${limit.retryAfterSeconds} seconds.`,
    };
  }

  if (!hasEditToken) {
    return {
      ok: false,
      status: 500,
      code: 'missing-edit-token',
      error: 'Submissions cannot be stored',
      hint: 'Set SANITY_API_EDIT_TOKEN.',
    };
  }

  let id: string;
  try {
    const created = await writeClient.create({
      _type: 'submission',
      name: values.name,
      email: values.email,
      message: values.message,
      page: values.page,
      userAgent: request.headers.get('user-agent') ?? undefined,
      receivedAt: new Date().toISOString(),
    });
    id = created._id;
  } catch (error) {
    console.error('[contact] failed to store submission', error);
    return {
      ok: false,
      status: 500,
      code: 'storage-failed',
      error: 'Could not store the submission',
      hint: 'Try again in a moment.',
    };
  }

  await notify(values, recipients, fromAddress);
  return { ok: true, id };
}

async function notify(values: ContactValues, recipients: string[], fromAddress?: string | null) {
  const from = env.RESEND_FROM ?? fromAddress ?? undefined;
  if (!env.RESEND_API_KEY || recipients.length === 0 || !from) {
    console.info(
      '[contact] stored submission from %s (email skipped: %s)',
      values.email,
      !env.RESEND_API_KEY
        ? 'no RESEND_API_KEY'
        : recipients.length === 0
          ? 'no recipients'
          : 'no from address',
    );
    return;
  }
  try {
    const { Resend } = await import('resend');
    const resend = new Resend(env.RESEND_API_KEY);
    await resend.emails.send({
      from,
      to: recipients,
      replyTo: values.email,
      subject: `New message from ${values.name}`,
      text: `${values.message}\n\nFrom: ${values.name} <${values.email}>\nPage: ${values.page}`,
    });
  } catch (error) {
    console.error('[contact] email failed (submission stored)', error);
  }
}
