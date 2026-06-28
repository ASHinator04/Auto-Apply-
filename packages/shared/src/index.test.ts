import { describe, expect, it } from "vitest";

import { APP_NAME, APP_PHASE } from "./index";

describe("shared package constants", () => {
  it("exports infrastructure placeholder metadata", () => {
    expect(APP_NAME).toBe("Job Agent");
    expect(APP_PHASE).toBe("Phase 0B.2");
  });
});
