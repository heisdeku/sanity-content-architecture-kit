import { createClient } from "next-sanity";
import { env } from "@/env";

const projectId = env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = env.NEXT_PUBLIC_SANITY_DATASET;
const apiVersion = env.NEXT_PUBLIC_SANITY_API_VERSION;

/** Absolute Studio URL, used by stega so click-to-edit opens the right place. */
export const studioUrl = `${env.NEXT_PUBLIC_URL.replace(/\/$/, "")}${env.NEXT_PUBLIC_SANITY_STUDIO_BASE_PATH}`;

/**
 * CDN off in production: the Next Data Cache fronts every published fetch, so
 * the live API only sees the first request after a tag is busted. CDN on in
 * development so local reloads do not spend live API calls.
 */
export const useCdn = env.SANITY_USE_CDN ?? env.NODE_ENV !== "production";

/** Public reads, published perspective. */
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn,
  perspective: "published",
  stega: { enabled: false, studioUrl },
});

/** Draft reads: token, no CDN, drafts perspective, stega on. Draft mode only. */
export const previewClient = client.withConfig({
  token: env.SANITY_API_VIEW_TOKEN,
  useCdn: false,
  perspective: "drafts",
  stega: { enabled: true, studioUrl },
});

/** Server-only writes (submissions, agent fields). Never import in a client component. */
export const writeClient = client.withConfig({
  token: env.SANITY_API_EDIT_TOKEN,
  useCdn: false,
  perspective: "drafts",
  stega: { enabled: false, studioUrl },
});

/** Agent Actions need a recent API version; everything else stays pinned. */
export const agentClient = writeClient.withConfig({ apiVersion: "vX" });
