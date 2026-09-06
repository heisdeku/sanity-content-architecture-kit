import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/**
 * The only place `process.env` is read. Import `env` everywhere else.
 * `proxy.ts` is the one documented exception (see the comment there).
 */
export const env = createEnv({
  server: {
    SANITY_API_VIEW_TOKEN: z.string().optional(),
    SANITY_API_EDIT_TOKEN: z.string().optional(),
    SANITY_REVALIDATE_SECRET: z.string().optional(),
    SANITY_USE_CDN: z
      .enum(["true", "false"])
      .optional()
      .transform((value) =>
        value === undefined ? undefined : value === "true",
      ),
    BASIC_AUTH_USER: z.string().optional(),
    BASIC_AUTH_PASSWORD: z.string().optional(),
    FORM_SECRET: z
      .string()
      .min(16, "FORM_SECRET must be at least 16 characters"),
    RESEND_API_KEY: z.string().optional(),
    RESEND_FROM: z.string().optional(),
    MUX_TOKEN_ID: z.string().optional(),
    MUX_TOKEN_SECRET: z.string().optional(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },
  client: {
    NEXT_PUBLIC_URL: z.string().url(),
    NEXT_PUBLIC_SANITY_PROJECT_ID: z.string().min(1),
    NEXT_PUBLIC_SANITY_DATASET: z.string().min(1),
    NEXT_PUBLIC_SANITY_API_VERSION: z.string().default("2025-02-19"),
    NEXT_PUBLIC_SANITY_STUDIO_BASE_PATH: z.string().default("/studio"),
    NEXT_PUBLIC_UMAMI_WEBSITE_ID: z.string().optional(),
    NEXT_PUBLIC_UMAMI_SRC: z.string().optional(),
  },
  // Next.js inlines NEXT_PUBLIC_* at build time, so client vars must be listed explicitly.
  experimental__runtimeEnv: {
    NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
    NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET,
    NEXT_PUBLIC_SANITY_API_VERSION: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
    NEXT_PUBLIC_SANITY_STUDIO_BASE_PATH:
      process.env.NEXT_PUBLIC_SANITY_STUDIO_BASE_PATH,
    NEXT_PUBLIC_UMAMI_WEBSITE_ID: process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID,
    NEXT_PUBLIC_UMAMI_SRC: process.env.NEXT_PUBLIC_UMAMI_SRC,
  },
  emptyStringAsUndefined: true,
  skipValidation: Boolean(process.env.SKIP_ENV_VALIDATION),
});
