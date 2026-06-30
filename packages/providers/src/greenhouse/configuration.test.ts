import {
  createGreenhouseConnectorConfiguration,
  DEFAULT_GREENHOUSE_BASE_URL,
  DEFAULT_GREENHOUSE_USER_AGENT,
} from "./configuration";
import { GreenhouseConnectorError } from "./errors";

describe("greenhouse connector configuration", () => {
  it("applies defaults around a required board token", () => {
    expect(createGreenhouseConnectorConfiguration({ boardToken: "example" })).toMatchObject({
      boardToken: "example",
      baseUrl: DEFAULT_GREENHOUSE_BASE_URL,
      timeoutMs: 15_000,
      userAgent: DEFAULT_GREENHOUSE_USER_AGENT,
      retryPolicy: {
        maxAttempts: 3,
        backoffMs: 250,
      },
      enabled: true,
      priority: 1_000,
      loggingLevel: "error",
      maxPages: 10,
    });
  });

  it("rejects invalid required values", () => {
    expect(() => createGreenhouseConnectorConfiguration({ boardToken: "" })).toThrow(
      GreenhouseConnectorError,
    );
    expect(() =>
      createGreenhouseConnectorConfiguration({
        boardToken: "example",
        baseUrl: "not-a-url",
      }),
    ).toThrow(GreenhouseConnectorError);
    expect(() =>
      createGreenhouseConnectorConfiguration({
        boardToken: "example",
        retryPolicy: {
          maxAttempts: 0,
        },
      }),
    ).toThrow(GreenhouseConnectorError);
  });
});
