import { createLeverConnectorConfiguration } from "./configuration";
import { LeverSearchConnector } from "./connector";
import type { LeverHttpClient } from "./http-client";

describe("lever search connector", () => {
  it("fetches pages, parses postings, and applies local supported filters", async () => {
    const urls: string[] = [];
    const httpClient = {
      async getJson(url: string) {
        urls.push(url);

        if (urls.length === 1) {
          return {
            payload: [
              {
                id: "posting-1",
                text: "Software Engineer",
                categories: {
                  location: "Remote",
                  team: "Engineering",
                  allLocations: ["Remote"],
                },
                workplaceType: "remote",
              },
              {
                id: "posting-2",
                text: "Recruiter",
                categories: {
                  location: "New York",
                  team: "People",
                  allLocations: ["New York"],
                },
              },
            ],
          };
        }

        return {
          payload: [
            {
              id: "posting-3",
              text: "Backend Engineer",
              categories: {
                location: "Remote - US",
                team: "Engineering",
                allLocations: ["Remote - US"],
              },
              workplaceType: "remote",
            },
          ],
        };
      },
    } satisfies Pick<LeverHttpClient, "getJson">;

    const connector = new LeverSearchConnector(
      createLeverConnectorConfiguration({
        site: "acme",
        maxPages: 5,
        pageSize: 2,
      }),
      {
        httpClient: httpClient as unknown as LeverHttpClient,
      },
    );

    const result = await connector.search({
      query: "engineer",
      locations: ["remote"],
      remoteOnly: true,
    });

    expect(result.totalFound).toBe(2);
    expect(result.pagesFetched).toBe(2);
    expect(result.jobs.map((job) => job.id)).toEqual(["posting-1", "posting-3"]);
    expect(new URL(urls[0] ?? "").searchParams.get("skip")).toBe("0");
    expect(new URL(urls[1] ?? "").searchParams.get("skip")).toBe("2");
  });

  it("stops pagination at configured max pages", async () => {
    const httpClient = {
      async getJson() {
        return {
          payload: [{ id: "posting-1" }],
        };
      },
    } satisfies Pick<LeverHttpClient, "getJson">;

    const connector = new LeverSearchConnector(
      createLeverConnectorConfiguration({
        site: "acme",
        maxPages: 2,
        pageSize: 1,
      }),
      {
        httpClient: httpClient as unknown as LeverHttpClient,
      },
    );

    await expect(connector.search()).resolves.toMatchObject({
      pagesFetched: 2,
      totalFound: 2,
    });
  });
});
