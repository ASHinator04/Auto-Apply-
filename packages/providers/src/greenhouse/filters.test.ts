import { WorkMode } from "@job-agent/contracts";

import { createGreenhouseSearchRequest, filterGreenhouseJobs } from "./filters";
import type { RawGreenhouseJob } from "./models";

function createJob(input: Partial<RawGreenhouseJob>): RawGreenhouseJob {
  return {
    departments: [],
    offices: [],
    providerMetadata: {
      provider: "greenhouse",
      boardToken: "acme",
    },
    raw: {},
    ...input,
  };
}

describe("greenhouse filters", () => {
  it("creates a Greenhouse request from shared search input", () => {
    expect(
      createGreenhouseSearchRequest({
        userId: "user-1",
        query: "engineer",
        locations: ["Remote"],
        workModes: [WorkMode.Remote],
      }),
    ).toEqual({
      query: "engineer",
      locations: ["Remote"],
      remoteOnly: true,
    });
  });

  it("filters raw jobs by query, location, department, and remote preference", () => {
    const jobs = [
      createJob({
        title: "Software Engineer",
        content: "Backend systems",
        location: { name: "Remote" },
        departments: [{ name: "Engineering" }],
      }),
      createJob({
        title: "Product Manager",
        location: { name: "New York" },
        departments: [{ name: "Product" }],
      }),
    ];

    expect(
      filterGreenhouseJobs(jobs, {
        query: "engineer",
        locations: ["remote"],
        departments: ["engineering"],
        remoteOnly: true,
      }),
    ).toHaveLength(1);
  });
});
