import { createAshbyConnectorConfiguration } from "./configuration";
import { AshbyConnectorError } from "./errors";

describe("ashby connector configuration", () => {
  it("creates defaults from a required job board name", () => {
    expect(createAshbyConnectorConfiguration({ jobBoardName: "acme" })).toMatchObject({
      jobBoardName: "acme",
      baseUrl: "https://api.ashbyhq.com/posting-api/job-board",
      timeoutMs: 15_000,
      userAgent: "JobAgentMVP/0.1",
      enabled: true,
      priority: 1_000,
      loggingLevel: "error",
      includeCompensation: true,
      retryPolicy: {
        maxAttempts: 3,
        backoffMs: 250,
      },
    });
  });

  it("rejects invalid configuration", () => {
    expect(() => createAshbyConnectorConfiguration({ jobBoardName: "" })).toThrow(
      AshbyConnectorError,
    );
    expect(() => createAshbyConnectorConfiguration({ jobBoardName: "acme", timeoutMs: 0 })).toThrow(
      AshbyConnectorError,
    );
  });
});
