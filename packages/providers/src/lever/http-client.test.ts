import { createLeverConnectorConfiguration } from "./configuration";
import { LeverConnectorError } from "./errors";
import { LeverHttpClient } from "./http-client";
import type { LeverFetch } from "./http-client";

function createResponse(status: number, payload: unknown, jsonError?: Error): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: {
      get(name: string) {
        return name.toLowerCase() === "retry-after" ? null : null;
      },
    },
    async json() {
      if (jsonError !== undefined) {
        throw jsonError;
      }

      return payload;
    },
  } as Response;
}

describe("lever http client", () => {
  it("requests JSON with configured headers", async () => {
    const calls: RequestInit[] = [];
    const fetchMock: LeverFetch = async (_url, init) => {
      calls.push(init ?? {});
      return createResponse(200, []);
    };
    const client = new LeverHttpClient(
      createLeverConnectorConfiguration({
        site: "acme",
        userAgent: "JobAgentTest/1.0",
      }),
      {
        fetch: fetchMock,
      },
    );

    await expect(client.getJson("https://example.com/jobs")).resolves.toEqual({
      payload: [],
    });
    expect(calls[0]?.headers).toMatchObject({
      "User-Agent": "JobAgentTest/1.0",
      Accept: "application/json",
    });
  });

  it("classifies invalid JSON without retrying", async () => {
    let attempts = 0;
    const client = new LeverHttpClient(
      createLeverConnectorConfiguration({
        site: "acme",
        retryPolicy: {
          maxAttempts: 2,
          backoffMs: 0,
        },
      }),
      {
        fetch: async () => {
          attempts += 1;
          return createResponse(200, undefined, new Error("Invalid JSON"));
        },
        sleep: async () => {},
      },
    );

    await expect(client.getJson("https://example.com/jobs")).rejects.toMatchObject({
      kind: "invalid_response",
    });
    expect(attempts).toBe(1);
  });

  it("retries transient responses and then succeeds", async () => {
    let attempts = 0;
    const client = new LeverHttpClient(
      createLeverConnectorConfiguration({
        site: "acme",
        retryPolicy: {
          maxAttempts: 2,
          backoffMs: 0,
        },
      }),
      {
        fetch: async () => {
          attempts += 1;
          return attempts === 1 ? createResponse(503, {}) : createResponse(200, []);
        },
        sleep: async () => {},
      },
    );

    await expect(client.getJson("https://example.com/jobs")).resolves.toMatchObject({
      payload: [],
    });
    expect(attempts).toBe(2);
  });

  it("raises useful errors for non-transient failures", async () => {
    const client = new LeverHttpClient(createLeverConnectorConfiguration({ site: "acme" }), {
      fetch: async () => createResponse(404, {}),
    });

    await expect(client.getJson("https://example.com/jobs")).rejects.toThrow(LeverConnectorError);
  });

  it("classifies exhausted rate limits", async () => {
    const client = new LeverHttpClient(
      createLeverConnectorConfiguration({
        site: "acme",
        retryPolicy: {
          maxAttempts: 1,
          backoffMs: 0,
        },
      }),
      {
        fetch: async () => createResponse(429, {}),
      },
    );

    await expect(client.getJson("https://example.com/jobs")).rejects.toMatchObject({
      kind: "rate_limited",
    });
  });

  it("classifies abort-style failures as timeouts", async () => {
    const client = new LeverHttpClient(createLeverConnectorConfiguration({ site: "acme" }), {
      fetch: async () => {
        throw { name: "AbortError" };
      },
    });

    await expect(client.getJson("https://example.com/jobs")).rejects.toMatchObject({
      kind: "timeout",
    });
  });
});
