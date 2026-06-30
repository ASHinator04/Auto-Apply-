import { createGreenhouseConnectorConfiguration } from "./configuration";
import { GreenhouseSearchConnector } from "./connector";
import type { GreenhouseHttpClient } from "./http-client";

describe("greenhouse search connector", () => {
  it("fetches pages, parses jobs, and applies local supported filters", async () => {
    const urls: string[] = [];
    const httpClient = {
      async getJson(url: string) {
        urls.push(url);

        if (urls.length === 1) {
          return {
            payload: {
              jobs: [
                {
                  id: 1,
                  title: "Software Engineer",
                  location: { name: "Remote" },
                  departments: [{ name: "Engineering" }],
                },
                {
                  id: 2,
                  title: "Recruiter",
                  location: { name: "New York" },
                  departments: [{ name: "People" }],
                },
              ],
            },
            nextPageUrl: "https://example.com/page-2",
          };
        }

        return {
          payload: {
            jobs: [
              {
                id: 3,
                title: "Backend Engineer",
                offices: [{ name: "Remote - US" }],
                departments: [{ name: "Engineering" }],
              },
            ],
          },
        };
      },
    } satisfies Pick<GreenhouseHttpClient, "getJson">;

    const connector = new GreenhouseSearchConnector(
      createGreenhouseConnectorConfiguration({
        boardToken: "acme",
        maxPages: 5,
      }),
      {
        httpClient: httpClient as GreenhouseHttpClient,
      },
    );

    const result = await connector.search({
      query: "engineer",
      locations: ["remote"],
      remoteOnly: true,
    });

    expect(result.totalFound).toBe(2);
    expect(result.pagesFetched).toBe(2);
    expect(result.jobs.map((job) => job.id)).toEqual([1, 3]);
  });

  it("stops pagination at configured max pages", async () => {
    const httpClient = {
      async getJson() {
        return {
          payload: { jobs: [] },
          nextPageUrl: "https://example.com/next",
        };
      },
    } satisfies Pick<GreenhouseHttpClient, "getJson">;

    const connector = new GreenhouseSearchConnector(
      createGreenhouseConnectorConfiguration({
        boardToken: "acme",
        maxPages: 2,
      }),
      {
        httpClient: httpClient as unknown as GreenhouseHttpClient,
      },
    );

    await expect(connector.search()).resolves.toMatchObject({
      pagesFetched: 2,
      totalFound: 0,
    });
  });
});
