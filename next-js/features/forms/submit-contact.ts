import "server-only";
import { z } from "zod";
import {
  type ContactValues,
  contactSchema,
} from "@/features/forms/contact-schema";
import { clientKey, rateLimit } from "@/features/spam-prevention/rate-limit";
import { verifyTimingToken } from "@/features/spam-prevention/timing-token";
import type { ApiError } from "@/features/utils/api-error";

export type SubmitResult =
  | { ok: true }
  | { ok: false; status: number; body: ApiError };

/** Persist and notify. Wired to Sanity + Resend once the workspace exists. */
export type SubmissionSink = (
  values: ContactValues,
  meta: { userAgent: string | null },
) => Promise<void>;

/**
 * Server-side contact submission. Validates the shared schema, the honeypot,
 * the timing token and the rate limit, then hands the values to `sink`.
 */
export async function submitContact(
  request: Request,
  sink: SubmissionSink,
): Promise<SubmitResult> {
  const limit = rateLimit(`contact:${clientKey(request)}`, {
    limit: 5,
    windowMs: 60_000,
  });
  if (!limit.ok) {
    return {
      ok: false,
      status: 429,
      body: {
        error: "Too many requests",
        code: "rate_limited",
        hint: "Wait a minute and try again.",
      },
    };
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return {
      ok: false,
      status: 400,
      body: { error: "Invalid JSON body", code: "invalid_body" },
    };
  }

  const parsed = contactSchema.safeParse(json);
  if (!parsed.success) {
    const honeypot = parsed.error.issues.find(
      (issue) => issue.path[0] === "_hp",
    );
    if (honeypot) {
      return {
        ok: false,
        status: 400,
        body: { error: "Rejected", code: "spam_detected" },
      };
    }
    const flat = z.flattenError(parsed.error);
    const first = Object.entries(flat.fieldErrors).find(
      ([, messages]) => messages && messages.length > 0,
    );
    return {
      ok: false,
      status: 400,
      body: {
        error: "Validation failed",
        code: "validation_error",
        hint: first ? `${first[0]}: ${first[1]?.[0]}` : undefined,
      },
    };
  }

  const timing = verifyTimingToken(parsed.data._t);
  if (!timing.ok) {
    const hints: Record<typeof timing.reason, string> = {
      invalid: "Reload the page and try again.",
      "too-fast": "That was quick. Take a moment and submit again.",
      expired: "The form expired. Reload the page and try again.",
    };
    return {
      ok: false,
      status: 400,
      body: {
        error: "Rejected",
        code: `timing_${timing.reason.replace("-", "_")}`,
        hint: hints[timing.reason],
      },
    };
  }

  try {
    await sink(parsed.data, { userAgent: request.headers.get("user-agent") });
  } catch (error) {
    console.error("[contact] sink failed", error);
    return {
      ok: false,
      status: 500,
      body: {
        error: "Could not store the submission",
        code: "storage_failed",
        hint: "Try again shortly.",
      },
    };
  }

  return { ok: true };
}
