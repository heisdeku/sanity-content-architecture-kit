/**
 * Exports the dataset to `backups/<date>.tar.gz` (documents + assets).
 * Run with `npm run sanity:backup [-- --dataset production]`.
 * Requires a Sanity CLI login (`npx sanity login`) or SANITY_AUTH_TOKEN.
 */
import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { loadEnvFile, resolveDataset, resolveProjectId } from "./sanity-env";

const { values } = parseArgs({
  options: {
    dataset: { type: "string" },
    "no-assets": { type: "boolean", default: false },
  },
});

loadEnvFile();
const projectId = resolveProjectId();
const dataset = values.dataset ?? resolveDataset();

const backupsDir = path.join(process.cwd(), "backups");
mkdirSync(backupsDir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const file = path.join(backupsDir, `${dataset}-${stamp}.tar.gz`);

console.log(
  `Exporting ${projectId}/${dataset} -> ${path.relative(process.cwd(), file)}`,
);
const args = ["sanity", "dataset", "export", dataset, file];
if (values["no-assets"]) args.push("--no-assets");

const result = spawnSync("npx", args, { stdio: "inherit", env: process.env });
if (result.status !== 0) {
  console.error("\nExport failed. Manual equivalent:");
  console.error(
    `  npx sanity dataset export ${dataset} ${path.relative(process.cwd(), file)}`,
  );
  process.exit(result.status ?? 1);
}
console.log("Backup written.");
