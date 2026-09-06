import { submissionSink } from "@/features/forms/submission-sink";
import { submitContact } from "@/features/forms/submit-contact";
import { apiError, apiOk } from "@/features/utils/api-error";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const result = await submitContact(request, submissionSink);
  if (!result.ok) return apiError(result.status, result.body);
  return apiOk({ ok: true });
}
