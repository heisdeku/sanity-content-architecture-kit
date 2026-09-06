import { DEFAULT_API_VERSION } from "./constants";

/**
 * The only place the studio workspace reads environment variables.
 *
 * Resolution order per value: `NEXT_PUBLIC_*` (Next.js), `PUBLIC_*` (Astro /
 * Vite), `SANITY_STUDIO_*` (Sanity CLI). Every access is written as a literal
 * member expression so bundlers can inline it: Next inlines
 * `process.env.NEXT_PUBLIC_*`, Vite inlines `import.meta.env.PUBLIC_*` and
 * replaces `import.meta.env` as a whole. In a Vite browser bundle `process` is
 * not defined and in a Next bundle `import.meta.env` is not defined, so both
 * lookups are guarded and the two results are merged.
 */

type EnvShape = {
  projectId?: string;
  dataset?: string;
  apiVersion?: string;
  studioBasePath?: string;
  appOrigin?: string;
  isDevelopment?: boolean;
};

type MetaEnv = Record<string, string | boolean | undefined>;

function readProcessEnv(): EnvShape {
  if (typeof process === "undefined" || typeof process.env === "undefined")
    return {};
  return {
    projectId:
      process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ??
      process.env.PUBLIC_SANITY_PROJECT_ID ??
      process.env.SANITY_STUDIO_PROJECT_ID,
    dataset:
      process.env.NEXT_PUBLIC_SANITY_DATASET ??
      process.env.PUBLIC_SANITY_DATASET ??
      process.env.SANITY_STUDIO_DATASET,
    apiVersion:
      process.env.NEXT_PUBLIC_SANITY_API_VERSION ??
      process.env.PUBLIC_SANITY_API_VERSION ??
      process.env.SANITY_STUDIO_API_VERSION,
    studioBasePath:
      process.env.NEXT_PUBLIC_SANITY_STUDIO_BASE_PATH ??
      process.env.PUBLIC_SANITY_STUDIO_BASE_PATH ??
      process.env.SANITY_STUDIO_BASE_PATH,
    appOrigin:
      process.env.NEXT_PUBLIC_URL ??
      process.env.PUBLIC_URL ??
      process.env.SANITY_STUDIO_APP_ORIGIN,
    isDevelopment: process.env.NODE_ENV
      ? process.env.NODE_ENV !== "production"
      : undefined,
  };
}

function readImportMetaEnv(): EnvShape {
  try {
    const env = (import.meta as unknown as { env?: MetaEnv }).env;
    if (!env) return {};
    const str = (value: string | boolean | undefined) =>
      typeof value === "string" ? value : undefined;
    return {
      projectId:
        str(env.PUBLIC_SANITY_PROJECT_ID) ?? str(env.SANITY_STUDIO_PROJECT_ID),
      dataset: str(env.PUBLIC_SANITY_DATASET) ?? str(env.SANITY_STUDIO_DATASET),
      apiVersion:
        str(env.PUBLIC_SANITY_API_VERSION) ??
        str(env.SANITY_STUDIO_API_VERSION),
      studioBasePath:
        str(env.PUBLIC_SANITY_STUDIO_BASE_PATH) ??
        str(env.SANITY_STUDIO_BASE_PATH),
      appOrigin: str(env.PUBLIC_URL) ?? str(env.SANITY_STUDIO_APP_ORIGIN),
      isDevelopment:
        env.DEV === true || env.DEV === "true"
          ? true
          : env.PROD === true || env.PROD === "true"
            ? false
            : undefined,
    };
  } catch {
    return {};
  }
}

const fromProcess = readProcessEnv();
const fromImportMeta = readImportMetaEnv();

function pick<K extends keyof EnvShape>(key: K): EnvShape[K] {
  return fromProcess[key] ?? fromImportMeta[key];
}

function assertValue(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(
      `Missing environment variable ${name}. Copy .env.example to .env and fill it in, or run npm run sanity:project-setup.`,
    );
  }
  return value;
}

export const projectId = assertValue(
  pick("projectId"),
  "NEXT_PUBLIC_SANITY_PROJECT_ID",
);
export const dataset = assertValue(
  pick("dataset"),
  "NEXT_PUBLIC_SANITY_DATASET",
);
export const apiVersion = pick("apiVersion") ?? DEFAULT_API_VERSION;
export const studioBasePath = pick("studioBasePath") ?? "/studio";
export const appOrigin = (pick("appOrigin") ?? "http://localhost:3000").replace(
  /\/$/,
  "",
);
export const isDevelopment = pick("isDevelopment") ?? false;
