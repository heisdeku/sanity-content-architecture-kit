import { generateMarkdown } from "@/features/agents/generate-markdown";
import { isSameOrigin } from "@/features/agents/same-origin";
import { apiError, apiOk } from "@/features/utils/api-error";

export const dynamic = "force-dynamic";

/** Studio button: POST { id } -> { markdown }. Same-origin only. */
export async function POST(request: Request) {
  if (!isSameOrigin(request))
    return apiError(403, { error: "Forbidden", code: "cross_origin" });
  const body = (await request.json().catch(() => null)) as {
    id?: unknown;
  } | null;
  if (!body || typeof body.id !== "string" || !body.id) {
    return apiError(400, {
      error: "Body must be { id: string }",
      code: "invalid_body",
    });
  }
  const result = await generateMarkdown(body.id);
  if (!result.ok)
    return apiError(result.status, {
      error: result.error,
      code: result.code,
      hint: result.hint,
    });
  return apiOk({ markdown: result.markdown });
}
