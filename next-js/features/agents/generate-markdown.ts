import "server-only";
import { env } from "@/env";
import {
  createSerializeContext,
  serializeDocument,
} from "@/features/agents/serialize-markdown";
import { muxStreamUrl } from "@/features/mux/poster-url";
import { writeClient } from "@/features/sanity/client";
import { assetUrl, type ImageLike } from "@/features/sanity/image";
import { type LinkValue, resolveLink } from "@/features/sanity/resolve-link";
import { absoluteUrl } from "@/features/utils/absolute-url";
import { DOCUMENT_FOR_SERIALIZER_QUERY } from "@/sanity/queries/documents/agents";

export type GenerateMarkdownResult =
  | { ok: true; markdown: string }
  | { ok: false; status: number; error: string; code: string; hint?: string };

/** Raw perspective: the Studio sends the exact id it is editing (`drafts.x` or `x`). */
const rawClient = writeClient.withConfig({ perspective: "raw" });

type AnyRecord = Record<string, unknown>;

function resolveHref(link: AnyRecord): string | null {
  const resolved = resolveLink(link as LinkValue);
  if (!resolved) return null;
  return resolved.external ? resolved.href : absoluteUrl(resolved.href);
}

function resolveMediaUrl(media: AnyRecord): string | null {
  switch (media.kind) {
    case "image":
      return assetUrl((media.image as ImageLike) ?? null);
    case "video": {
      const playbackId = (media.video as { playbackId?: string } | null)
        ?.playbackId;
      return playbackId ? muxStreamUrl(playbackId) : null;
    }
    case "lottie":
      return (media.lottie as { url?: string } | null)?.url ?? null;
    case "rive":
      return (media.rive as { url?: string } | null)?.url ?? null;
    default:
      return null;
  }
}

export const serializeContext = createSerializeContext({
  resolveHref,
  resolveMediaUrl,
});

/** Runs the deterministic serializer over a document with drafts as stored. */
export async function generateMarkdown(
  id: string,
): Promise<GenerateMarkdownResult> {
  if (!env.SANITY_API_EDIT_TOKEN) {
    return {
      ok: false,
      status: 500,
      error: "SANITY_API_EDIT_TOKEN is not set",
      code: "not_configured",
    };
  }

  const doc = (await rawClient.fetch(
    DOCUMENT_FOR_SERIALIZER_QUERY,
    { id },
    { cache: "no-store" },
  )) as
    | (AnyRecord & {
        _type: string;
        title?: string | null;
        path?: string | null;
        pageBuilder?: unknown[] | null;
      })
    | null;

  if (!doc)
    return {
      ok: false,
      status: 404,
      error: "Document not found",
      code: "not_found",
    };
  if (!doc.path) {
    return {
      ok: false,
      status: 400,
      error: "Document has no route yet",
      code: "no_path",
      hint: "Set the URI or slug first.",
    };
  }

  const seo = doc.seo as { description?: string | null } | null | undefined;
  const extra: AnyRecord = {};
  if (doc._type === "article") {
    extra.excerpt = doc.excerpt;
    extra.author = doc.author;
    extra.cover = doc.cover;
  }
  if (doc._type === "legalPage") extra.body = doc.body;

  const markdown = serializeDocument(
    {
      title: (doc.title as string | null) ?? doc.path,
      url: absoluteUrl(doc.path),
      description: doc._type === "article" ? null : seo?.description,
      sections: doc.pageBuilder ?? [],
      extra,
    },
    serializeContext,
  );

  return { ok: true, markdown };
}
