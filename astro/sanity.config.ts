/**
 * Studio configuration. Byte-identical between the Next.js and Astro
 * editions: it only imports from packages and from `./sanity/...`.
 */
import { assist } from "@sanity/assist";
import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { presentationTool } from "sanity/presentation";
import { structureTool } from "sanity/structure";
import { media } from "sanity-plugin-media";
import { muxInput } from "sanity-plugin-mux-input";
import {
  apiVersion,
  dataset,
  isDevelopment,
  projectId,
  studioBasePath,
} from "./sanity/config/env";
import { previewUrl, resolve } from "./sanity/presentation/resolve";
import { schemaTypes } from "./sanity/schemas/index-registry";
import { defaultDocumentNode } from "./sanity/structure/default-document-node";
import {
  filterSingletonTemplates,
  singletonDocumentActions,
  singletonPlugin,
} from "./sanity/structure/singleton-plugin";
import { structure } from "./sanity/structure/structure";

export default defineConfig({
  name: "default",
  title: "Content",
  projectId,
  dataset,
  basePath: studioBasePath,
  plugins: [
    structureTool({ structure, defaultDocumentNode }),
    presentationTool({ resolve, previewUrl }),
    ...(isDevelopment ? [visionTool({ defaultApiVersion: apiVersion })] : []),
    assist(),
    muxInput(),
    media(),
    singletonPlugin(),
  ],
  schema: {
    types: schemaTypes,
    templates: (templates) => filterSingletonTemplates(templates),
  },
  document: {
    actions: (actions, context) => singletonDocumentActions(actions, context),
  },
});
