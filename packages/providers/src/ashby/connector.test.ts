import { createAshbyConnectorConfiguration } from "./configuration";
import { AshbySearchConnector } from "./connector";
import type { AshbyHttpClient } from "./http-client";

describe("ashby search connector", () => {
  it("fetches postings, parses jobs, and applies local supported filters", async () => {
    const urls: string[] = [];
    const httpClient = {
      async getJson(url: string) {
        urls.push(url);

        return {
          payload: {
            jobs: [
              {
                title: "Software Engineer",
                location: "Remote",
                department: "Engineering",
                team: "Platform",
                isRemote: true,
                workplaceType: "Remote",
                descriptionPlain: "Build APIs.",
              },
              {
                title: "Recruiter",
                location: "New York",
                department: "People",
                team: "Talent",
                isRemote: false,
              },
            ],
          },
        };
      },
    } satisfies Pick<AshbyHttpClient, "getJson">;

    const connector = new AshbySearchConnector(
      createAshbyConnectorConfiguration({
        jobBoardName: "acme",
      }),
      {
        httpClient: httpClient as unknown as AshbyHttpClient,
      },
    );

    const result = await connector.search({
      query: "engineer",
      locations: ["remote"],
      remoteOnly: true,
    });

    expect(result.totalFound).toBe(1);
    expect(result.pagesFetched).toBe(1);
    expect(result.jobs.map((job) => job.title)).toEqual(["Software Engineer"]);
    expect(new URL(urls[0] ?? "").searchParams.get("includeCompensation")).toBe("true");
  });

  it("returns empty results from a valid empty Ashby response", async () => {
    const httpClient = {
      async getJson() {
        return {
          payload: { jobs: [] },
        };
      },
    } satisfies Pick<AshbyHttpClient, "getJson">;

    const connector = new AshbySearchConnector(
      createAshbyConnectorConfiguration({
        jobBoardName: "acme",
      }),
      {
        httpClient: httpClient as unknown as AshbyHttpClient,
      },
    );

    await expect(connector.search()).resolves.toMatchObject({
      pagesFetched: 1,
      totalFound: 0,
      jobs: [],
    });
  });
});
