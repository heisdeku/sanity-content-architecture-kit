/** Shared helpers for the sanity:* scripts: .env loading and id resolution. */
import { existsSync } from "node:fs";
import path from "node:path";

/** Loads `.env` (and `.env.local`) into process.env without overriding existing values. */
export function loadEnvFile(): void {
  for (const name of [".env", ".env.local"]) {
    const file = path.join(process.cwd(), name);
    if (!existsSync(file)) continue;
    try {
      // Node 20.12+ / 22+. Existing variables win.
      const before = { ...process.env };
      process.loadEnvFile(file);
      for (const [key, value] of Object.entries(before)) {
        if (value !== undefined) process.env[key] = value;
      }
    } catch {
      // Ignore malformed files; the CLI will complain about missing ids.
    }
  }
}

export function resolveProjectId(): string {
  const id =
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ??
    process.env.PUBLIC_SANITY_PROJECT_ID ??
    process.env.SANITY_STUDIO_PROJECT_ID ??
    process.env.SANITY_PROJECT_ID;
  if (!id) {
    console.error(
      "Missing NEXT_PUBLIC_SANITY_PROJECT_ID (or PUBLIC_/SANITY_STUDIO_). Run npm run sanity:project-setup.",
    );
    process.exit(1);
  }
  return id;
}

export function resolveDataset(): string {
  return (
    process.env.NEXT_PUBLIC_SANITY_DATASET ??
    process.env.PUBLIC_SANITY_DATASET ??
    process.env.SANITY_STUDIO_DATASET ??
    process.env.SANITY_DATASET ??
    "production"
  );
}
