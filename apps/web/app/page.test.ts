import { describe, expect, it } from "vitest";

import { APP_NAME, APP_PHASE } from "@job-agent/shared";

describe("placeholder page content", () => {
  it("exposes the project name and current infrastructure phase", () => {
    expect(APP_NAME).toBe("Job Agent");
    expect(APP_PHASE).toBe("Phase 0 Complete");
  });
});
