import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const sourceRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

function listSourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);

    if (entry.isDirectory()) {
      return listSourceFiles(path);
    }

    if (!entry.name.endsWith(".ts") || entry.name.endsWith(".test.ts")) {
      return [];
    }

    return [path];
  });
}

describe("domain package dependency direction", () => {
  it("does not depend on UI, framework, storage, automation, or network APIs", () => {
    const forbiddenPatterns = [
      /from\s+["'](?:react|next|playwright|fastapi|sqlalchemy|sqlite3?|better-sqlite3)["']/,
      /fetch\s*\(/,
      /https?:\/\//,
    ];

    for (const filePath of listSourceFiles(sourceRoot)) {
      const source = readFileSync(filePath, "utf8");

      for (const pattern of forbiddenPatterns) {
        expect(source, `${filePath} must not match ${pattern.toString()}`).not.toMatch(pattern);
      }
    }
  });
});
