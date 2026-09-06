import { ImageResponse } from "next/og";
import { getPublishedSite } from "@/features/site/get-site";
import { DEFAULT_SITE_NAME } from "@/features/site/metadata";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Fallback Open Graph card: site name + title. Used when no image is set. */
export async function GET(request: Request) {
  const site = await getPublishedSite();
  const siteName = site?.name ?? DEFAULT_SITE_NAME;
  const title = (
    new URL(request.url).searchParams.get("title") ?? siteName
  ).slice(0, 120);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: "#0c0a09",
        color: "#fafaf9",
        fontFamily: "ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <div
        style={{
          fontSize: 24,
          letterSpacing: 4,
          textTransform: "uppercase",
          color: "#a8a29e",
        }}
      >
        {siteName}
      </div>
      <div
        style={{
          fontSize: title.length > 60 ? 56 : 72,
          fontWeight: 600,
          lineHeight: 1.1,
          letterSpacing: -1,
        }}
      >
        {title}
      </div>
      {site?.tagline ? (
        <div style={{ fontSize: 28, color: "#a8a29e" }}>{site.tagline}</div>
      ) : (
        <div />
      )}
    </div>,
    { width: 1200, height: 630 },
  );
}
