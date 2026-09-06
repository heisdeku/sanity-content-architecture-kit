import {
  Newspaper as ArticlesIcon,
  Tag as CategoriesIcon,
  House as HomeIcon,
  Image as ImagesIcon,
  Scale as LegalIcon,
  FileText as PagesIcon,
  Settings as SiteIcon,
  Inbox as SubmissionsIcon,
  Video as VideosIcon,
} from "lucide-react";
import type { StructureBuilder, StructureResolver } from "sanity/structure";
import { DOCUMENT_TYPES, SINGLETON_IDS } from "../config/constants";

function singleton(
  S: StructureBuilder,
  type: "homepage" | "site",
  title: string,
  icon: typeof HomeIcon,
) {
  return S.listItem()
    .id(SINGLETON_IDS[type])
    .title(title)
    .icon(icon)
    .child(
      S.document()
        .schemaType(DOCUMENT_TYPES[type])
        .documentId(SINGLETON_IDS[type])
        .title(title),
    );
}

/**
 * Desk structure. Top level, in this order, nothing else: Homepage, Pages,
 * Articles (with Categories nested), Legal, Submissions, Site, then a divider
 * and the asset libraries. Documents are grouped by what they represent, not
 * by how they are implemented.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .id("content")
    .title("Content")
    .items([
      singleton(S, "homepage", "Homepage", HomeIcon),
      S.listItem()
        .id("pages")
        .title("Pages")
        .icon(PagesIcon)
        .child(S.documentTypeList(DOCUMENT_TYPES.page).title("Pages")),
      S.listItem()
        .id("articles")
        .title("Articles")
        .icon(ArticlesIcon)
        .child(
          S.list()
            .id("articles-list")
            .title("Articles")
            .items([
              S.listItem()
                .id("all-articles")
                .title("All articles")
                .icon(ArticlesIcon)
                .child(
                  S.documentTypeList(DOCUMENT_TYPES.article)
                    .title("Articles")
                    .defaultOrdering([
                      { field: "publishedAt", direction: "desc" },
                    ]),
                ),
              S.listItem()
                .id("categories")
                .title("Categories")
                .icon(CategoriesIcon)
                .child(
                  S.documentTypeList(DOCUMENT_TYPES.category).title(
                    "Categories",
                  ),
                ),
            ]),
        ),
      S.listItem()
        .id("legal")
        .title("Legal")
        .icon(LegalIcon)
        .child(
          S.documentTypeList(DOCUMENT_TYPES.legalPage).title("Legal pages"),
        ),
      S.listItem()
        .id("submissions")
        .title("Submissions")
        .icon(SubmissionsIcon)
        .child(
          S.documentTypeList(DOCUMENT_TYPES.submission)
            .title("Submissions")
            .defaultOrdering([{ field: "receivedAt", direction: "desc" }])
            .canHandleIntent(() => false),
        ),
      singleton(S, "site", "Site", SiteIcon),
      S.divider(),
      S.listItem()
        .id("media-library")
        .title("Media library")
        .icon(ImagesIcon)
        .child(
          S.documentTypeList("sanity.imageAsset")
            .title("Images")
            .defaultOrdering([{ field: "_createdAt", direction: "desc" }]),
        ),
      S.listItem()
        .id("videos")
        .title("Videos")
        .icon(VideosIcon)
        .child(
          S.documentTypeList("mux.videoAsset")
            .title("Videos")
            .defaultOrdering([{ field: "_createdAt", direction: "desc" }]),
        ),
    ]);
