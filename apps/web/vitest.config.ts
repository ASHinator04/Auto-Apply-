import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const sharedEntry = fileURLToPath(new URL("../../packages/shared/src/index.ts", import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@job-agent/shared": sharedEntry,
    },
  },
  test: {
    globals: true,
    include: ["app/**/*.test.ts", "components/**/*.test.ts"],
  },
});
