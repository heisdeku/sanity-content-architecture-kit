/**
 * Copies one dataset to another inside the same project.
 * Run with `npm run sanity:copy-dataset -- --from production --to staging`.
 *
 * Tries the server-side copy first (`sanity dataset copy`, available on
 * plans with dataset copy). Falls back to export + import, which works on
 * every plan.
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { parseArgs } from "node:util";
import { loadEnvFile, resolveDataset } from "./sanity-env";

const { values } = parseArgs({
  options: {
    from: { type: "string" },
    to: { type: "string" },
    "skip-history": { type: "boolean", default: true },
  },
});

loadEnvFile();
const from = values.from ?? resolveDataset();
const to = values.to;

if (!to) {
  console.error(
    "Usage: npm run sanity:copy-dataset -- --from <dataset> --to <dataset>",
  );
  process.exit(1);
}
if (from === to) {
  console.error("Source and target datasets must differ");
  process.exit(1);
}

function run(args: string[]): number {
  const result = spawnSync("npx", ["sanity", ...args], {
    stdio: "inherit",
    env: process.env,
  });
  return result.status ?? 1;
}

console.log(`Copying ${from} -> ${to}`);
const copyArgs = ["dataset", "copy", from, to, "--detach"];
if (values["skip-history"]) copyArgs.push("--skip-history");

if (run(copyArgs) === 0) {
  console.log(
    "Server-side copy started. Track it with: npx sanity dataset copy --list",
  );
  process.exit(0);
}

console.log("\nServer-side copy unavailable. Falling back to export + import.");
const dir = mkdtempSync(path.join(tmpdir(), "sanity-copy-"));
const archive = path.join(dir, `${from}.tar.gz`);
try {
  if (run(["dataset", "export", from, archive]) !== 0)
    throw new Error("export failed");
  // Creating the target is idempotent enough: a failure here usually means it exists.
  run(["dataset", "create", to, "--visibility", "public"]);
  if (run(["dataset", "import", archive, to, "--replace"]) !== 0)
    throw new Error("import failed");
  console.log(`Copied ${from} -> ${to}`);
} catch (error) {
  console.error(
    `\n${error instanceof Error ? error.message : String(error)}. Manual equivalent:`,
  );
  console.error(`  npx sanity dataset export ${from} ${from}.tar.gz`);
  console.error(`  npx sanity dataset create ${to} --visibility public`);
  console.error(`  npx sanity dataset import ${from}.tar.gz ${to} --replace`);
  process.exit(1);
} finally {
  rmSync(dir, { recursive: true, force: true });
}
