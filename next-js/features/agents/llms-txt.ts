import { publishedFetch, safe } from "@/features/sanity/fetch";
import { typeTag } from "@/features/sanity/tags";
import { LLMS_TXT_QUERY } from "@/sanity/queries/documents/site";

export type LlmsTxtResult =
  | { status: 200; body: string }
  | { status: 404; reason: string };

/** Published llms.txt, or 404 when the toggle is off or the field is empty. */
export async function getLlmsTxt(): Promise<LlmsTxtResult> {
  const { data } = await safe(
    publishedFetch({ query: LLMS_TXT_QUERY, tags: [typeTag("site")] }),
  );
  if (!data) return { status: 404, reason: "No site document" };
  if (!data.serveLlmsTxt)
    return { status: 404, reason: "llms.txt is not served" };
  if (!data.llmsTxt?.trim())
    return { status: 404, reason: "llms.txt is empty" };
  return {
    status: 200,
    body: data.llmsTxt.endsWith("\n") ? data.llmsTxt : `${data.llmsTxt}\n`,
  };
}
