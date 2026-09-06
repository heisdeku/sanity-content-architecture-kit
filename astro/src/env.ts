import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

// The ONLY place environment variables are read. Server files import `env`;
// islands receive public values as props from .astro files.
//
// Astro exposes .env values through import.meta.env at build time and the
// hosting runtime (Vercel) exposes them through process.env, so both are
// merged, with import.meta.env winning. This module must never be imported
// by browser code (process is not defined there).
const runtimeEnv: Record<string, string | boolean | undefined> = {
  ...(typeof process !== 'undefined' ? process.env : {}),
  ...import.meta.env,
};

const optionalString = z.string().optional();
const booleanString = z
  .enum(['true', 'false'])
  .optional()
  .transform((value) => (value === undefined ? undefined : value === 'true'));

export const env = createEnv({
  clientPrefix: 'PUBLIC_',
  client: {
    PUBLIC_URL: z.url().default('http://localhost:4321'),
    PUBLIC_SANITY_PROJECT_ID: z.string().min(1).default('abcd1234'),
    PUBLIC_SANITY_DATASET: z.string().min(1).default('production'),
    PUBLIC_SANITY_API_VERSION: z.string().min(1).default('2025-02-19'),
    PUBLIC_SANITY_STUDIO_BASE_PATH: z.string().startsWith('/').default('/studio'),
    PUBLIC_UMAMI_WEBSITE_ID: optionalString,
    PUBLIC_UMAMI_SRC: optionalString,
  },
  server: {
    SANITY_API_VIEW_TOKEN: optionalString,
    SANITY_API_EDIT_TOKEN: optionalString,
    SANITY_REVALIDATE_SECRET: optionalString,
    SANITY_USE_CDN: booleanString,
    BASIC_AUTH_USER: optionalString,
    BASIC_AUTH_PASSWORD: optionalString,
    FORM_SECRET: z.string().min(8).default('development-only-form-secret'),
    RESEND_API_KEY: optionalString,
    RESEND_FROM: optionalString,
    MUX_TOKEN_ID: optionalString,
    MUX_TOKEN_SECRET: optionalString,
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  },
  runtimeEnv,
  emptyStringAsUndefined: true,
  skipValidation: Boolean(runtimeEnv.SKIP_ENV_VALIDATION),
  isServer: typeof import.meta.env.SSR === 'boolean' ? import.meta.env.SSR : true,
});

export const isProduction = env.NODE_ENV === 'production';
