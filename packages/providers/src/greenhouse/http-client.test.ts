import { createGreenhouseConnectorConfiguration } from "./configuration";
import { GreenhouseConnectorError } from "./errors";
import { GreenhouseHttpClient } from "./http-client";
import type { GreenhouseFetch } from "./http-client";

function createResponse(
  status: number,
  payload: unknown,
  headers: Record<string, string> = {},
  jsonError?: Error,
): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: {
      get(name: string) {
        return headers[name.toLowerCase()] ?? null;
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

describe("greenhouse http client", () => {
  it("requests JSON with configured headers", async () => {
    const calls: RequestInit[] = [];
    const fetchMock: GreenhouseFetch = async (_url, init) => {
      calls.push(init ?? {});
      return createResponse(200, { jobs: [] });
    };
    const client = new GreenhouseHttpClient(
      createGreenhouseConnectorConfiguration({
        boardToken: "acme",
        userAgent: "JobAgentTest/1.0",
      }),
      {
        fetch: fetchMock,
      },
    );

    await expect(client.getJson("https://example.com/jobs")).resolves.toEqual({
      payload: { jobs: [] },
      nextPageUrl: undefined,
    });
    expect(calls[0]?.headers).toMatchObject({
      "User-Agent": "JobAgentTest/1.0",
      Accept: "application/json",
    });
  });

  it("extracts pagination from Greenhouse link headers", async () => {
    const client = new GreenhouseHttpClient(
      createGreenhouseConnectorConfiguration({ boardToken: "acme" }),
      {
        fetch: async () =>
          createResponse(
            200,
            { jobs: [] },
            {
              link: '<https://boards-api.greenhouse.io/page-2>; rel="next"',
            },
          ),
      },
    );

    await expect(client.getJson("https://boards-api.greenhouse.io/v1/jobs")).resolves.toMatchObject(
      {
        nextPageUrl: "https://boards-api.greenhouse.io/page-2",
      },
    );
  });

  it("ignores pagination links outside the configured Greenhouse origin", async () => {
    const client = new GreenhouseHttpClient(
      createGreenhouseConnectorConfiguration({ boardToken: "acme" }),
      {
        fetch: async () =>
          createResponse(200, { jobs: [] }, { link: '<https://evil.example/page-2>; rel="next"' }),
      },
    );

    await expect(client.getJson("https://boards-api.greenhouse.io/v1/jobs")).resolves.toMatchObject(
      {
        nextPageUrl: undefined,
      },
    );
  });

  it("classifies invalid JSON without retrying", async () => {
    let attempts = 0;
    const client = new GreenhouseHttpClient(
      createGreenhouseConnectorConfiguration({
        boardToken: "acme",
        retryPolicy: {
          maxAttempts: 2,
          backoffMs: 0,
        },
      }),
      {
        fetch: async () => {
          attempts += 1;
          return createResponse(200, undefined, {}, new Error("Invalid JSON"));
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
    const client = new GreenhouseHttpClient(
      createGreenhouseConnectorConfiguration({
        boardToken: "acme",
        retryPolicy: {
          maxAttempts: 2,
          backoffMs: 0,
        },
      }),
      {
        fetch: async () => {
          attempts += 1;
          return attempts === 1 ? createResponse(503, {}) : createResponse(200, { jobs: [] });
        },
        sleep: async () => {},
      },
    );

    await expect(client.getJson("https://example.com/jobs")).resolves.toMatchObject({
      payload: { jobs: [] },
    });
    expect(attempts).toBe(2);
  });

  it("raises useful errors for non-transient failures", async () => {
    const client = new GreenhouseHttpClient(
      createGreenhouseConnectorConfiguration({ boardToken: "acme" }),
      {
        fetch: async () => createResponse(404, {}),
      },
    );

    await expect(client.getJson("https://example.com/jobs")).rejects.toThrow(
      GreenhouseConnectorError,
    );
  });

  it("classifies abort-style failures as timeouts", async () => {
    const client = new GreenhouseHttpClient(
      createGreenhouseConnectorConfiguration({ boardToken: "acme" }),
      {
        fetch: async () => {
          throw { name: "AbortError" };
        },
      },
    );

    await expect(client.getJson("https://example.com/jobs")).rejects.toMatchObject({
      kind: "timeout",
    });
  });
});
