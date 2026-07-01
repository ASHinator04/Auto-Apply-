import { AshbyConnectorError } from "./errors";
import { parseAshbyPostingsResponse } from "./parser";

describe("ashby response parser", () => {
  it("parses available Ashby posting fields without inventing missing values", () => {
    const jobs = parseAshbyPostingsResponse(
      {
        apiVersion: "1",
        jobs: [
          {
            title: "Software Engineer",
            location: "Remote",
            secondaryLocations: [
              {
                location: "San Francisco",
                address: {
                  addressLocality: "San Francisco",
                  addressRegion: "California",
                  addressCountry: "USA",
                },
              },
            ],
            department: "Engineering",
            team: "Platform",
            isListed: true,
            isRemote: true,
            workplaceType: "Remote",
            descriptionPlain: "Build reliable systems.",
            publishedAt: "2026-01-01T00:00:00.000Z",
            employmentType: "FullTime",
            address: {
              postalAddress: {
                addressLocality: "Remote",
                addressCountry: "USA",
              },
            },
            jobUrl: "https://jobs.ashbyhq.com/acme/software-engineer",
            applyUrl: "https://jobs.ashbyhq.com/acme/software-engineer/application",
            compensation: {
              compensationTierSummary: "$100K - $140K",
              scrapeableCompensationSalarySummary: "$100K - $140K",
              compensationTiers: [
                {
                  id: "tier-1",
                  title: "Zone A",
                  components: [
                    {
                      id: "component-1",
                      compensationType: "Salary",
                      currencyCode: "USD",
                      minValue: 100000,
                      maxValue: 140000,
                    },
                  ],
                },
              ],
              summaryComponents: [
                {
                  compensationType: "Salary",
                  currencyCode: "USD",
                  minValue: 100000,
                  maxValue: 140000,
                },
              ],
            },
          },
          {
            title: "Designer",
          },
        ],
      },
      "acme",
    );

    expect(jobs[0]).toMatchObject({
      title: "Software Engineer",
      location: "Remote",
      department: "Engineering",
      team: "Platform",
      isRemote: true,
      employmentType: "FullTime",
      secondaryLocations: [
        {
          location: "San Francisco",
        },
      ],
      compensation: {
        compensationTierSummary: "$100K - $140K",
        summaryComponents: [
          {
            compensationType: "Salary",
            currencyCode: "USD",
          },
        ],
      },
      providerMetadata: {
        provider: "ashby",
        jobBoardName: "acme",
      },
    });
    expect(jobs[1]).toMatchObject({
      title: "Designer",
      secondaryLocations: [],
    });
  });

  it("rejects unexpected Ashby response payloads", () => {
    expect(() => parseAshbyPostingsResponse({ postings: [] }, "acme")).toThrow(AshbyConnectorError);
  });

  it("accepts an empty Ashby jobs array", () => {
    expect(parseAshbyPostingsResponse({ jobs: [] }, "acme")).toEqual([]);
  });

  it("stores a raw top-level payload snapshot", () => {
    const sourceJob = {
      title: "Software Engineer",
    };
    const jobs = parseAshbyPostingsResponse({ jobs: [sourceJob] }, "acme");

    sourceJob.title = "Changed Later";

    expect(jobs[0]?.raw.title).toBe("Software Engineer");
  });
});
