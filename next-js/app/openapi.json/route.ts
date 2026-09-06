import { buildOpenApiDocument } from "@/features/agents/openapi";
import { getPublishedSite } from "@/features/site/get-site";
import { DEFAULT_SITE_NAME } from "@/features/site/metadata";
import { siteOrigin } from "@/features/utils/absolute-url";

export const dynamic = "force-dynamic";

export async function GET() {
  const site = await getPublishedSite();
  const document = buildOpenApiDocument({
    siteName: site?.name ?? DEFAULT_SITE_NAME,
    origin: siteOrigin(),
  });
  return Response.json(document, {
    headers: { "cache-control": "public, max-age=3600" },
  });
}
