import { generateLlmsTxt } from "@/features/agents/generate-llms-txt";
import { isSameOrigin } from "@/features/agents/same-origin";
import { apiError, apiOk } from "@/features/utils/api-error";

export const dynamic = "force-dynamic";

/** Studio button: POST -> { llmsTxt }. Same-origin only. */
export async function POST(request: Request) {
  if (!isSameOrigin(request))
    return apiError(403, { error: "Forbidden", code: "cross_origin" });
  try {
    const result = await generateLlmsTxt();
    if (!result.ok)
      return apiError(result.status, {
        error: result.error,
        code: result.code,
        hint: result.hint,
      });
    return apiOk({ llmsTxt: result.llmsTxt });
  } catch (error) {
    console.error("[llms.txt] generation failed", error);
    return apiError(502, {
      error: "Generation failed",
      code: "generation_failed",
      hint: error instanceof Error ? error.message : undefined,
    });
  }
}
