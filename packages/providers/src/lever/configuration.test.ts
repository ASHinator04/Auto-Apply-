import { LeverConnectorError } from "./errors";
import { createLeverConnectorConfiguration } from "./configuration";

describe("lever connector configuration", () => {
  it("creates defaults from a required site", () => {
    expect(createLeverConnectorConfiguration({ site: "acme" })).toMatchObject({
      site: "acme",
      baseUrl: "https://api.lever.co/v0/postings",
      timeoutMs: 15_000,
      userAgent: "JobAgentMVP/0.1",
      enabled: true,
      priority: 1_000,
      loggingLevel: "error",
      maxPages: 10,
      pageSize: 100,
      retryPolicy: {
        maxAttempts: 3,
        backoffMs: 250,
      },
    });
  });

  it("rejects invalid configuration", () => {
    expect(() => createLeverConnectorConfiguration({ site: "" })).toThrow(LeverConnectorError);
    expect(() => createLeverConnectorConfiguration({ site: "acme", pageSize: 0 })).toThrow(
      LeverConnectorError,
    );
  });
});
