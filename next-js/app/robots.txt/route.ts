import { buildRobotsTxt } from "@/features/site/robots";
import { siteOrigin } from "@/features/utils/absolute-url";

export const dynamic = "force-dynamic";

export function GET() {
  return new Response(buildRobotsTxt(siteOrigin()), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
