import { getLlmsTxt } from "@/features/agents/llms-txt";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await getLlmsTxt();
  if (result.status !== 200) {
    return new Response(`Not found: ${result.reason}\n`, {
      status: 404,
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  }
  return new Response(result.body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=300",
    },
  });
}
