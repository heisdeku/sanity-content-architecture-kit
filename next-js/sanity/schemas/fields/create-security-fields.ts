import { defineField } from "sanity";

export type SecurityFieldsOptions = {
  group?: string;
  /** `site` gates the whole site, `document` gates one route. */
  variant?: "document" | "site";
};

/**
 * Security fields, grouped under `security`. Credentials always come from
 * env (`BASIC_AUTH_USER`, `BASIC_AUTH_PASSWORD`), never from the CMS.
 * Site-wide protection wins over per-document toggles.
 */
export function createSecurityFields({
  group,
  variant = "document",
}: SecurityFieldsOptions = {}) {
  if (variant === "site") {
    return [
      defineField({
        name: "security",
        title: "Security",
        type: "object",
        group,
        options: { collapsible: false },
        fields: [
          defineField({
            name: "basicAuthEnabled",
            title: "Password protect the whole site",
            type: "boolean",
            description: "Requires the credentials set in the environment",
            initialValue: false,
          }),
        ],
      }),
    ];
  }

  return [
    defineField({
      name: "security",
      title: "Security",
      type: "object",
      group,
      options: { collapsible: false },
      fields: [
        defineField({
          name: "passwordProtect",
          title: "Password protect this page",
          type: "boolean",
          description: "Requires the credentials set in the environment",
          initialValue: false,
        }),
      ],
    }),
  ];
}
