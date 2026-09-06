import { markdownNotFound } from "@/features/agents/markdown";
import { getPublishedSite } from "@/features/site/get-site";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const path = new URL(request.url).searchParams.get("path") ?? "";
  const site = await getPublishedSite();
  const result = await markdownNotFound(path, site?.name);
  return new Response(result.body, {
    status: 404,
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
