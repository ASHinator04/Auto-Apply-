import { GreenhouseConnectorError } from "./errors";
import { parseGreenhouseJobsResponse } from "./parser";

describe("greenhouse response parser", () => {
  it("parses available Greenhouse job fields without inventing missing values", () => {
    const jobs = parseGreenhouseJobsResponse(
      {
        jobs: [
          {
            id: 123,
            internal_job_id: 456,
            title: "Software Engineer",
            absolute_url: "https://example.com/jobs/123",
            location: { name: "Remote" },
            departments: [{ id: 1, name: "Engineering" }],
            offices: [{ id: 2, name: "United States" }],
            updated_at: "2026-01-01T00:00:00Z",
            requisition_id: "REQ-1",
            content: "Build useful software.",
            metadata: [{ name: "Employment Type", value: "Full-time" }],
          },
          {
            id: 124,
            title: "Designer",
          },
        ],
      },
      "acme",
    );

    expect(jobs[0]).toMatchObject({
      id: 123,
      internalJobId: 456,
      title: "Software Engineer",
      absoluteUrl: "https://example.com/jobs/123",
      location: { name: "Remote" },
      departments: [{ id: 1, name: "Engineering" }],
      offices: [{ id: 2, name: "United States" }],
      providerMetadata: {
        provider: "greenhouse",
        boardToken: "acme",
      },
    });
    expect(jobs[1]).toMatchObject({
      id: 124,
      title: "Designer",
      departments: [],
      offices: [],
    });
  });

  it("rejects unexpected Greenhouse response payloads", () => {
    expect(() => parseGreenhouseJobsResponse({ jobs: {} }, "acme")).toThrow(
      GreenhouseConnectorError,
    );
  });

  it("stores a raw top-level payload snapshot", () => {
    const sourceJob = {
      id: 123,
      title: "Software Engineer",
    };
    const jobs = parseGreenhouseJobsResponse({ jobs: [sourceJob] }, "acme");

    sourceJob.title = "Changed Later";

    expect(jobs[0]?.raw.title).toBe("Software Engineer");
  });
});
