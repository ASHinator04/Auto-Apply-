import { describe, expect, it } from "vitest";

import { POST } from "./route";

describe("search route", () => {
  it("returns a validation error for invalid JSON", async () => {
    const response = await POST(
      new Request("http://localhost/api/search", {
        body: "{",
        headers: { "Content-Type": "application/json" },
        method: "POST",
      }),
    );

    expect(response.status).toBe(400);
  });

  it("returns a validation error for unsupported work modes", async () => {
    const response = await POST(
      new Request("http://localhost/api/search", {
        body: JSON.stringify({ query: "software", workModes: ["elsewhere"] }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      }),
    );
    const payload = (await response.json()) as { detail: string };

    expect(response.status).toBe(400);
    expect(payload.detail).toBe("workModes contains an unsupported value.");
  });
});
