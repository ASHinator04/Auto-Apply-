import { LeverConnectorError } from "./errors";
import { parseLeverPostingsResponse } from "./parser";

describe("lever response parser", () => {
  it("parses available Lever posting fields without inventing missing values", () => {
    const jobs = parseLeverPostingsResponse(
      [
        {
          id: "posting-1",
          text: "Software Engineer",
          categories: {
            location: "Remote",
            commitment: "Full-time",
            team: "Engineering",
            department: "Product",
            allLocations: ["Remote", "United States"],
          },
          country: "US",
          workplaceType: "remote",
          hostedUrl: "https://jobs.lever.co/acme/posting-1",
          applyUrl: "https://jobs.lever.co/acme/posting-1/apply",
          openingPlain: "Build useful software.",
          descriptionPlain: "Build reliable systems.",
          lists: [{ text: "Requirements", content: "<li>TypeScript</li>" }],
          salaryRange: {
            currency: "USD",
            interval: "year",
            min: 100000,
            max: 150000,
          },
        },
        {
          id: "posting-2",
          text: "Designer",
        },
      ],
      "acme",
    );

    expect(jobs[0]).toMatchObject({
      id: "posting-1",
      title: "Software Engineer",
      categories: {
        location: "Remote",
        commitment: "Full-time",
        team: "Engineering",
        department: "Product",
        allLocations: ["Remote", "United States"],
      },
      workplaceType: "remote",
      providerMetadata: {
        provider: "lever",
        site: "acme",
      },
    });
    expect(jobs[1]).toMatchObject({
      id: "posting-2",
      title: "Designer",
      categories: {
        allLocations: [],
      },
      lists: [],
    });
  });

  it("rejects unexpected Lever response payloads", () => {
    expect(() => parseLeverPostingsResponse({ postings: [] }, "acme")).toThrow(LeverConnectorError);
  });

  it("accepts an empty Lever postings array", () => {
    expect(parseLeverPostingsResponse([], "acme")).toEqual([]);
  });

  it("stores a raw top-level payload snapshot", () => {
    const sourceJob = {
      id: "posting-1",
      text: "Software Engineer",
    };
    const jobs = parseLeverPostingsResponse([sourceJob], "acme");

    sourceJob.text = "Changed Later";

    expect(jobs[0]?.raw.text).toBe("Software Engineer");
  });
});
