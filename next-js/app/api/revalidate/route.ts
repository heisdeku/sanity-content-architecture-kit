import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";
import { parseRevalidateWebhook } from "@/features/sanity/webhook";
import { apiError, apiOk } from "@/features/utils/api-error";

export const dynamic = "force-dynamic";

/** Sanity GROQ webhook target. Busts the tags derived from `{ _type, _id, uri }`. */
export async function POST(request: NextRequest) {
  const result = await parseRevalidateWebhook(request);
  if (!result.ok)
    return apiError(result.status, { error: result.error, code: result.code });
  for (const tag of result.tags) revalidateTag(tag, "max");
  return apiOk({ revalidated: true, tags: result.tags, now: Date.now() });
}
