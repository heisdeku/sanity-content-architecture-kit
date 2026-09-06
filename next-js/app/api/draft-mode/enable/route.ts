import { defineEnableDraftMode } from "next-sanity/draft-mode";
import { previewClient } from "@/features/sanity/client";

export const dynamic = "force-dynamic";

/** Opened by the Studio Presentation tool with a signed secret. */
export const { GET } = defineEnableDraftMode({ client: previewClient });
