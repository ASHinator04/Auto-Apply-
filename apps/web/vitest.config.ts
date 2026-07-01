import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const sharedEntry = fileURLToPath(new URL("../../packages/shared/src/index.ts", import.meta.url));
const contractsEntry = fileURLToPath(
  new URL("../../contracts/domain/src/index.ts", import.meta.url),
);
const domainEntry = fileURLToPath(new URL("../../packages/domain/src/index.ts", import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@job-agent/contracts": contractsEntry,
      "@job-agent/domain": domainEntry,
      "@job-agent/shared": sharedEntry,
    },
  },
  test: {
    globals: true,
    include: [
      "app/**/*.test.ts",
      "app/**/*.test.tsx",
      "components/**/*.test.ts",
      "components/**/*.test.tsx",
    ],
  },
});
