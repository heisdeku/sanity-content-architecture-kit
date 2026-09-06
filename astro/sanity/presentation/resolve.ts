import {
  defineDocuments,
  defineLocations,
  type PresentationPluginOptions,
} from "sanity/presentation";
import {
  DOCUMENT_TYPES,
  ROUTE_NAMESPACES,
  SINGLETON_IDS,
} from "../config/constants";
import { appOrigin } from "../config/env";

/**
 * Presentation tool wiring.
 *
 * `locations` tells the Studio where a document is used on the site (the
 * "open in Presentation" links). `mainDocuments` maps a preview URL back to
 * the document that owns the route so the editor sees the right form.
 */
export const resolve: PresentationPluginOptions["resolve"] = {
  mainDocuments: defineDocuments([
    {
      route: "/",
      filter: `_type == "${DOCUMENT_TYPES.homepage}" && _id == "${SINGLETON_IDS.homepage}"`,
    },
    {
      route: `${ROUTE_NAMESPACES.article}/:slug`,
      filter: `_type == "${DOCUMENT_TYPES.article}" && slug.current == $slug`,
    },
    {
      route: `${ROUTE_NAMESPACES.legalPage}/:slug`,
      filter: `_type == "${DOCUMENT_TYPES.legalPage}" && slug.current == $slug`,
    },
    {
      route: "/:uri*",
      filter: `_type == "${DOCUMENT_TYPES.page}" && uri.current in ["/" + $uri, $uri]`,
    },
  ]),
  locations: {
    [DOCUMENT_TYPES.homepage]: defineLocations({
      select: { title: "title" },
      resolve: (doc) => ({
        locations: [{ title: doc?.title || "Homepage", href: "/" }],
      }),
    }),
    [DOCUMENT_TYPES.page]: defineLocations({
      select: { title: "title", uri: "uri.current" },
      resolve: (doc) =>
        doc?.uri
          ? {
              locations: [
                { title: doc.title || "Untitled page", href: doc.uri },
              ],
            }
          : { message: "Set a path to preview this page", tone: "caution" },
    }),
    [DOCUMENT_TYPES.article]: defineLocations({
      select: { title: "title", slug: "slug.current" },
      resolve: (doc) =>
        doc?.slug
          ? {
              locations: [
                {
                  title: doc.title || "Untitled article",
                  href: `${ROUTE_NAMESPACES.article}/${doc.slug}`,
                },
                { title: "All articles", href: ROUTE_NAMESPACES.article },
              ],
            }
          : { message: "Set a slug to preview this article", tone: "caution" },
    }),
    [DOCUMENT_TYPES.legalPage]: defineLocations({
      select: { title: "title", slug: "slug.current" },
      resolve: (doc) =>
        doc?.slug
          ? {
              locations: [
                {
                  title: doc.title || "Legal page",
                  href: `${ROUTE_NAMESPACES.legalPage}/${doc.slug}`,
                },
              ],
            }
          : { message: "Set a slug to preview this page", tone: "caution" },
    }),
    [DOCUMENT_TYPES.site]: defineLocations({
      message: "Site settings appear on every page",
      tone: "positive",
      locations: [{ title: "Homepage", href: "/" }],
    }),
  },
};

/** Preview URL configuration shared by both editions. */
export const previewUrl: PresentationPluginOptions["previewUrl"] = {
  origin: appOrigin,
  preview: "/",
  previewMode: {
    enable: "/api/draft-mode/enable",
    disable: "/api/draft-mode/disable",
  },
};
