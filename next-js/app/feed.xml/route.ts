import { buildFeed } from "@/features/site/feed";
import { getPublishedSite } from "@/features/site/get-site";

export const dynamic = "force-dynamic";

export async function GET() {
  const site = await getPublishedSite();
  return new Response(await buildFeed(site), {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, max-age=600",
    },
  });
}
