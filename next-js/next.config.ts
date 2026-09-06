import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  reactCompiler: true,
  typedRoutes: true,
  // View transitions need no flag in Next 16: the App Router ships a React
  // canary that exports <ViewTransition>. See features/view-transition.
  logging: isDev ? { fetches: { fullUrl: true } } : undefined,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io" },
      { protocol: "https", hostname: "image.mux.com" },
    ],
  },
};

export default nextConfig;
