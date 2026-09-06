/**
 * Interactive project setup. Run with `npm run sanity:project-setup`.
 *
 * Creates (or adopts) a Sanity project and dataset, mints a viewer and an
 * editor token, adds CORS origins, registers the revalidate webhook, writes
 * `.env` from `.env.example`, and imports `seed/seed.ndjson`.
 *
 * Every remote step can be skipped, and every failure prints the manual
 * equivalent so the setup can always be finished by hand.
 */
import { randomBytes } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import { stdin, stdout } from "node:process";
import { createInterface } from "node:readline/promises";
import { createClient } from "@sanity/client";

const ROOT = process.cwd();
const API = "https://api.sanity.io";
const API_VERSION = "2025-02-19";
const WEBHOOK_PROJECTION =
  '{ _type, _id, "uri": coalesce(uri.current, slug.current) }';
const WEBHOOK_FILTER =
  '_type in ["homepage", "page", "article", "category", "legalPage", "site"]';

const rl = createInterface({ input: stdin, output: stdout });

const log = {
  title: (text: string) => console.log(`\n\x1b[1m${text}\x1b[0m`),
  info: (text: string) => console.log(`  ${text}`),
  ok: (text: string) => console.log(`  \x1b[32m✓\x1b[0m ${text}`),
  warn: (text: string) => console.log(`  \x1b[33m!\x1b[0m ${text}`),
  manual: (lines: string[]) => {
    console.log("  \x1b[33mDo this manually:\x1b[0m");
    for (const line of lines) console.log(`    ${line}`);
  },
};

async function ask(question: string, fallback = ""): Promise<string> {
  const suffix = fallback ? ` (${fallback})` : "";
  const answer = (await rl.question(`  ${question}${suffix}: `)).trim();
  return answer || fallback;
}

async function confirm(question: string, fallback = true): Promise<boolean> {
  const answer = (
    await rl.question(`  ${question} [${fallback ? "Y/n" : "y/N"}]: `)
  )
    .trim()
    .toLowerCase();
  if (!answer) return fallback;
  return answer.startsWith("y");
}

type StepOptions<T> = {
  title: string;
  run: () => Promise<T>;
  manual: string[];
  optional?: boolean;
};

/** Runs a remote step. Skippable up front; on failure prints the manual equivalent. */
async function step<T>({
  title,
  run,
  manual,
  optional = true,
}: StepOptions<T>): Promise<T | undefined> {
  log.title(title);
  if (optional && !(await confirm("Run this step?"))) {
    log.warn("Skipped");
    log.manual(manual);
    return undefined;
  }
  try {
    return await run();
  } catch (error) {
    log.warn(error instanceof Error ? error.message : String(error));
    log.manual(manual);
    return undefined;
  }
}

// --- Auth ------------------------------------------------------------------

async function resolveAuthToken(): Promise<string> {
  if (process.env.SANITY_AUTH_TOKEN) return process.env.SANITY_AUTH_TOKEN;
  const configPath = path.join(homedir(), ".config", "sanity", "config.json");
  if (existsSync(configPath)) {
    try {
      const config = JSON.parse(await readFile(configPath, "utf8")) as {
        authToken?: string;
      };
      if (config.authToken) {
        log.ok(`Using the Sanity CLI login from ${configPath}`);
        return config.authToken;
      }
    } catch {
      // fall through to the prompt
    }
  }
  log.warn(
    "No Sanity login found. Run `npx sanity login` in another terminal, or paste a personal token.",
  );
  log.info(
    "Personal tokens: https://www.sanity.io/manage -> your project -> API -> Tokens (needs Deploy Studio or Admin)",
  );
  const token = await ask("Auth token (leave empty to skip every remote step)");
  return token;
}

let authToken = "";

async function api<T>(
  method: string,
  route: string,
  body?: unknown,
  version = "v2021-06-07",
): Promise<T> {
  if (!authToken) throw new Error("No auth token available");
  const response = await fetch(`${API}/${version}${route}`, {
    method,
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(
      `${method} ${route} failed (${response.status}): ${text.slice(0, 300)}`,
    );
  }
  return (text ? JSON.parse(text) : {}) as T;
}

// --- Env file ----------------------------------------------------------------

const ENV_TEMPLATE = `# Public
PUBLIC_URL=http://localhost:4321
PUBLIC_SANITY_PROJECT_ID=
PUBLIC_SANITY_DATASET=production
PUBLIC_SANITY_API_VERSION=2025-02-19
PUBLIC_SANITY_STUDIO_BASE_PATH=/studio

# Sanity tokens
SANITY_API_VIEW_TOKEN=
SANITY_API_EDIT_TOKEN=
SANITY_REVALIDATE_SECRET=
SANITY_USE_CDN=

# Basic auth
BASIC_AUTH_USER=
BASIC_AUTH_PASSWORD=

# Forms
FORM_SECRET=
RESEND_API_KEY=
RESEND_FROM=

# Analytics
PUBLIC_UMAMI_WEBSITE_ID=
PUBLIC_UMAMI_SRC=

# Mux (Studio plugin)
MUX_TOKEN_ID=
MUX_TOKEN_SECRET=
`;

function upsertEnv(
  source: string,
  values: Record<string, string | undefined>,
): string {
  const lines = source.split("\n");
  const seen = new Set<string>();
  const updated = lines.map((line) => {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match) return line;
    const [, name] = match;
    if (!name) return line;
    seen.add(name);
    const value = values[name];
    return value === undefined ? line : `${name}=${value}`;
  });
  for (const [name, value] of Object.entries(values)) {
    if (
      value !== undefined &&
      !seen.has(name)
    ) {
      updated.push(`${name}=${value}`);
    }
  }
  return updated.join("\n");
}

// --- Seed --------------------------------------------------------------------

async function importSeed(
  projectId: string,
  dataset: string,
  token: string,
): Promise<number> {
  const file = path.join(ROOT, "seed", "seed.ndjson");
  const raw = await readFile(file, "utf8");
  const docs = raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line) as { _id: string; _type: string });

  const client = createClient({
    projectId,
    dataset,
    token,
    apiVersion: API_VERSION,
    useCdn: false,
  });
  const batchSize = 25;
  for (let index = 0; index < docs.length; index += batchSize) {
    const transaction = client.transaction();
    for (const doc of docs.slice(index, index + batchSize))
      transaction.createOrReplace(doc);
    await transaction.commit();
  }
  return docs.length;
}

// --- Main --------------------------------------------------------------------

async function main() {
  log.title("Sanity project setup");
  log.info(
    "Answer the prompts. Every remote step can be skipped and finished by hand later.",
  );

  authToken = await resolveAuthToken();

  // 1. Project
  const existingProjectId = await ask(
    "Existing project id (leave empty to create one)",
  );
  let projectId = existingProjectId;
  if (!projectId) {
    const displayName = await ask(
      "Project name",
      path.basename(path.dirname(ROOT)) || "Content architecture kit",
    );
    const organizationId = await ask("Organization id (optional)");
    const created = await step({
      title: "1. Create project",
      optional: false,
      run: () =>
        api<{ id: string }>("POST", "/projects", {
          displayName,
          ...(organizationId ? { organizationId } : {}),
        }),
      manual: [
        "Create a project at https://www.sanity.io/manage and note its id,",
        "then re-run this script and enter it as the existing project id.",
      ],
    });
    projectId = created?.id ?? "";
    if (projectId) log.ok(`Project ${projectId} created`);
  }
  if (!projectId) {
    log.warn(
      "No project id. Writing .env with placeholders so the app still builds.",
    );
  }

  // 2. Dataset
  const dataset = await ask("Dataset name", "production");
  if (projectId) {
    await step({
      title: "2. Create dataset",
      run: async () => {
        await api("PUT", `/projects/${projectId}/datasets/${dataset}`, {
          aclMode: "public",
        });
        log.ok(`Dataset "${dataset}" ready (public read)`);
      },
      manual: [`npx sanity dataset create ${dataset} --visibility public`],
    });
  }

  // 3. Tokens
  let viewToken = "";
  let editToken = "";
  if (projectId) {
    const tokens = await step({
      title: "3. Create API tokens (viewer + editor)",
      run: async () => {
        const viewer = await api<{ key: string }>(
          "POST",
          `/projects/${projectId}/tokens`,
          {
            label: `kit-viewer-${Date.now()}`,
            roleName: "viewer",
          },
        );
        const editor = await api<{ key: string }>(
          "POST",
          `/projects/${projectId}/tokens`,
          {
            label: `kit-editor-${Date.now()}`,
            roleName: "editor",
          },
        );
        log.ok("Tokens created (they are written to .env, never printed)");
        return { viewer: viewer.key, editor: editor.key };
      },
      manual: [
        `Open https://www.sanity.io/manage/project/${projectId}/api#tokens`,
        "Add a token with the Viewer role -> SANITY_API_VIEW_TOKEN",
        "Add a token with the Editor role -> SANITY_API_EDIT_TOKEN",
      ],
    });
    viewToken = tokens?.viewer ?? "";
    editToken = tokens?.editor ?? "";
  }

  // 4. CORS
  const productionUrl = (
    await ask("Production URL (optional, e.g. https://example.com)")
  ).replace(/\/$/, "");
  const origins = [
    "http://localhost:4321",
    ...(productionUrl ? [productionUrl] : []),
  ];
  if (projectId) {
    await step({
      title: "4. Add CORS origins",
      run: async () => {
        const existing = await api<{ origin: string }[]>(
          "GET",
          `/projects/${projectId}/cors`,
        );
        const known = new Set(existing.map((entry) => entry.origin));
        for (const origin of origins) {
          if (known.has(origin)) {
            log.ok(`${origin} already allowed`);
            continue;
          }
          await api("POST", `/projects/${projectId}/cors`, {
            origin,
            allowCredentials: true,
          });
          log.ok(`${origin} allowed`);
        }
      },
      manual: origins.map(
        (origin) => `npx sanity cors add ${origin} --credentials`,
      ),
    });
  }

  // 5. Webhook
  const revalidateSecret = randomBytes(24).toString("hex");
  if (projectId) {
    const webhookUrl = `${productionUrl || "https://example.com"}/api/revalidate`;
    await step({
      title: "5. Register the revalidate webhook",
      run: async () => {
        if (!productionUrl) {
          throw new Error(
            "No production URL given; the webhook needs a public URL",
          );
        }
        await api(
          "POST",
          `/hooks/projects/${projectId}`,
          {
            name: "revalidate",
            description: "Tag-based revalidation for the frontend",
            dataset,
            url: webhookUrl,
            on: ["create", "update", "delete"],
            filter: WEBHOOK_FILTER,
            projection: WEBHOOK_PROJECTION,
            secret: revalidateSecret,
            type: "document",
            apiVersion: "v2021-03-25",
            includeDrafts: false,
            httpMethod: "POST",
            headers: {},
          },
          "v2021-10-04",
        );
        log.ok(`Webhook -> ${webhookUrl}`);
      },
      manual: [
        `Open https://www.sanity.io/manage/project/${projectId}/api#webhooks and add a GROQ-powered webhook:`,
        `  URL: ${webhookUrl}`,
        `  Dataset: ${dataset}   Trigger on: create, update, delete   Drafts: off`,
        `  Filter: ${WEBHOOK_FILTER}`,
        `  Projection: ${WEBHOOK_PROJECTION}`,
        "  Secret: the SANITY_REVALIDATE_SECRET value written to .env",
      ],
    });
  }

  // 6. .env
  log.title("6. Write .env");
  const examplePath = path.join(ROOT, ".env.example");
  const envPath = path.join(ROOT, ".env");
  const base = existsSync(envPath)
    ? await readFile(envPath, "utf8")
    : existsSync(examplePath)
      ? await readFile(examplePath, "utf8")
      : ENV_TEMPLATE;
  const envValues: Record<string, string | undefined> = {
    PUBLIC_SANITY_PROJECT_ID: projectId || "abcd1234",
    PUBLIC_SANITY_DATASET: dataset,
    PUBLIC_SANITY_API_VERSION: API_VERSION,
    PUBLIC_SANITY_STUDIO_BASE_PATH: "/studio",
    PUBLIC_URL: "http://localhost:4321",
    SANITY_API_VIEW_TOKEN: viewToken || undefined,
    SANITY_API_EDIT_TOKEN: editToken || undefined,
    SANITY_REVALIDATE_SECRET: revalidateSecret,
    FORM_SECRET: randomBytes(24).toString("hex"),
  };
  await writeFile(envPath, upsertEnv(base, envValues), "utf8");
  log.ok(
    `${path.relative(ROOT, envPath)} written${existsSync(envPath) ? "" : " from .env.example"}`,
  );
  if (!viewToken || !editToken)
    log.warn("Fill SANITY_API_VIEW_TOKEN / SANITY_API_EDIT_TOKEN by hand");

  // 7. Seed
  if (projectId) {
    await step({
      title: "7. Import the seed dataset",
      run: async () => {
        const token = editToken || authToken;
        const count = await importSeed(projectId, dataset, token);
        log.ok(`${count} documents imported into ${dataset}`);
      },
      manual: [
        `npx sanity dataset import seed/seed.ndjson ${dataset} --replace`,
      ],
    });
  }

  log.title("Done");
  log.info("Next: npm run dev, then open http://localhost:4321/studio");
  if (projectId)
    log.info(
      `Manage the project: https://www.sanity.io/manage/project/${projectId}`,
    );
  rl.close();
}

main().catch((error) => {
  console.error(error);
  rl.close();
  process.exit(1);
});
