import {
  getMarkdownForPath,
  markdownNotFound,
} from "@/features/agents/markdown";
import { getPublishedSite } from "@/features/site/get-site";
import { AGENT_MARKDOWN_HEADER, AGENT_MARKDOWN_PATH_HEADER } from "@/proxy";

export const dynamic = "force-dynamic";

const headers = {
  "content-type": "text/markdown; charset=utf-8",
  "cache-control": "private, no-store",
  vary: "Accept",
};

/** Only reachable through the proxy rewrite; the header proves it. */
export async function GET(request: Request) {
  if (request.headers.get(AGENT_MARKDOWN_HEADER) !== "1") {
    return Response.json(
      { error: "Not found", code: "not_found" },
      { status: 404 },
    );
  }
  const path =
    request.headers.get(AGENT_MARKDOWN_PATH_HEADER) ??
    new URL(request.url).searchParams.get("path") ??
    "/";
  const site = await getPublishedSite();
  const result = path.startsWith("/")
    ? await getMarkdownForPath(path, site?.name)
    : await markdownNotFound(path, site?.name);
  return new Response(result.body, { status: result.status, headers });
}
