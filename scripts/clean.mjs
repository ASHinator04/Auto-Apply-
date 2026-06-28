import { rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const workspace = path.resolve(scriptDir, "..");

const targets = [
  "apps/web/.next",
  "contracts/domain/dist",
  "packages/shared/dist",
  ".pytest_cache",
  ".ruff_cache",
  "coverage",
  "htmlcov",
];

for (const target of targets) {
  const resolved = path.resolve(workspace, target);
  if (!resolved.startsWith(workspace)) {
    throw new Error(`Refusing to remove path outside workspace: ${resolved}`);
  }
  await rm(resolved, { force: true, recursive: true });
}

console.log("Clean complete.");
