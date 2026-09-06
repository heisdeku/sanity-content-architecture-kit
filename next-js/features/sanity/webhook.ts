import "server-only";
import type { NextRequest } from "next/server";
import { parseBody } from "next-sanity/webhook";
import { env } from "@/env";
import { tagsForDocument, type WebhookDocument } from "@/features/sanity/tags";

export type WebhookResult =
  | { ok: true; body: WebhookDocument; tags: string[] }
  | { ok: false; status: number; error: string; code: string };

/**
 * Validates the GROQ webhook signature (`@sanity/webhook` under the hood)
 * and derives the tags to bust. Expected projection:
 *   { _type, _id, "uri": coalesce(uri.current, slug.current) }
 */
export async function parseRevalidateWebhook(
  request: NextRequest,
): Promise<WebhookResult> {
  const secret = env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    return {
      ok: false,
      status: 500,
      error: "SANITY_REVALIDATE_SECRET is not set",
      code: "not_configured",
    };
  }

  const { isValidSignature, body } = await parseBody<WebhookDocument>(
    request,
    secret,
    false,
  );
  if (!isValidSignature) {
    return {
      ok: false,
      status: 401,
      error: "Invalid signature",
      code: "invalid_signature",
    };
  }
  if (!body?._type || !body._id) {
    return {
      ok: false,
      status: 400,
      error: "Body must include _type and _id",
      code: "invalid_body",
    };
  }

  return { ok: true, body, tags: tagsForDocument(body) };
}
