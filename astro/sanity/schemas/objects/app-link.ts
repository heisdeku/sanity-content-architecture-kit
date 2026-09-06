import { Link as LinkIcon } from "lucide-react";
import { defineField, defineType } from "sanity";
import { LinkInput } from "../../components/link-input";
import {
  LINK_KINDS,
  LINKABLE_DOCUMENT_TYPES,
  type LinkKind,
} from "../../config/constants";

type LinkValue = {
  kind?: LinkKind;
  label?: string;
  internal?: { _ref?: string };
  href?: string;
  email?: string;
  phone?: string;
  file?: { asset?: { _ref?: string } };
  params?: string;
};

const KIND_TITLES: Record<LinkKind, string> = {
  internal: "Internal page",
  external: "External URL",
  email: "Email address",
  phone: "Phone number",
  file: "File download",
  params: "URL parameters",
};

/** Which payload field belongs to which kind. Also used by the input component. */
export const LINK_KIND_FIELDS: Record<LinkKind, string> = {
  internal: "internal",
  external: "href",
  email: "email",
  phone: "phone",
  file: "file",
  params: "params",
};

const isKind = (kind: LinkKind) => (context: { parent?: unknown }) =>
  (context.parent as LinkValue | undefined)?.kind !== kind;

export const appLink = defineType({
  name: "appLink",
  title: "Link",
  type: "object",
  icon: LinkIcon,
  components: { input: LinkInput },
  fields: [
    defineField({
      name: "kind",
      title: "Type",
      type: "string",
      description: "Where this link points",
      initialValue: "internal",
      options: {
        layout: "radio",
        direction: "horizontal",
        list: LINK_KINDS.map((value) => ({ value, title: KIND_TITLES[value] })),
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      description: "Visible text. Leave empty to use the target title",
      validation: (rule) => rule.max(80),
    }),
    defineField({
      name: "internal",
      title: "Page",
      type: "reference",
      description: "Document to link to",
      to: LINKABLE_DOCUMENT_TYPES.map((type) => ({ type })),
      options: { disableNew: true },
      hidden: isKind("internal"),
    }),
    defineField({
      name: "href",
      title: "URL",
      type: "url",
      description: "Full address including https://",
      hidden: isKind("external"),
      validation: (rule) =>
        rule.uri({ scheme: ["http", "https"], allowRelative: false }),
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      description: "Address to open in the mail client",
      hidden: isKind("email"),
      validation: (rule) => rule.email(),
    }),
    defineField({
      name: "phone",
      title: "Phone",
      type: "string",
      description: "Number in international format, e.g. +14155550132",
      hidden: isKind("phone"),
      validation: (rule) =>
        rule.regex(/^\+?[0-9 ()-]{6,24}$/, { name: "phone number" }),
    }),
    defineField({
      name: "file",
      title: "File",
      type: "file",
      description: "File to download",
      hidden: isKind("file"),
    }),
    defineField({
      name: "params",
      title: "Parameters",
      type: "string",
      description:
        "Query string appended to the current URL, e.g. ?contact=open",
      hidden: isKind("params"),
      validation: (rule) =>
        rule.regex(/^\?[^\s#]+$/, { name: "query string starting with ?" }),
    }),
    defineField({
      name: "newTab",
      title: "Open in new tab",
      type: "boolean",
      description: "Open the target in a new browser tab",
      initialValue: false,
      hidden: ({ parent }) => {
        const kind = (parent as LinkValue | undefined)?.kind;
        return kind !== "external" && kind !== "internal" && kind !== "file";
      },
    }),
    defineField({
      name: "download",
      title: "Force download",
      type: "boolean",
      description: "Download the file instead of opening it",
      initialValue: true,
      hidden: isKind("file"),
    }),
  ],
  validation: (rule) =>
    rule.custom((value) => {
      const link = value as LinkValue | undefined;
      if (!link?.kind) return true;
      switch (link.kind) {
        case "internal":
          return link.internal?._ref ? true : "Select a page to link to";
        case "external":
          return link.href ? true : "Enter a URL";
        case "email":
          return link.email ? true : "Enter an email address";
        case "phone":
          return link.phone ? true : "Enter a phone number";
        case "file":
          return link.file?.asset?._ref ? true : "Upload a file";
        case "params":
          return link.params ? true : "Enter the URL parameters";
        default:
          return true;
      }
    }),
  preview: {
    select: {
      kind: "kind",
      label: "label",
      internalTitle: "internal.title",
      href: "href",
      email: "email",
      phone: "phone",
      params: "params",
    },
    prepare({ kind, label, internalTitle, href, email, phone, params }) {
      const target =
        kind === "internal"
          ? internalTitle
          : kind === "external"
            ? href
            : kind === "email"
              ? email
              : kind === "phone"
                ? phone
                : kind === "params"
                  ? params
                  : "File";
      return {
        title: label || target || "Link",
        subtitle: label
          ? `${KIND_TITLES[kind as LinkKind] ?? kind}: ${target ?? ""}`
          : KIND_TITLES[kind as LinkKind],
      };
    },
  },
});
