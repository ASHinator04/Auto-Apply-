import { filterLeverJobs } from "./filters";
import type { RawLeverJob } from "./models";

const jobs: RawLeverJob[] = [
  {
    id: "posting-1",
    title: "Backend Engineer",
    categories: {
      location: "Remote",
      commitment: "Full-time",
      team: "Engineering",
      department: "Product",
      allLocations: ["Remote", "United States"],
    },
    workplaceType: "remote",
    lists: [],
    providerMetadata: {
      provider: "lever",
      site: "acme",
    },
    raw: {},
  },
  {
    id: "posting-2",
    title: "Recruiter",
    categories: {
      location: "New York",
      commitment: "Contract",
      team: "People",
      department: "Operations",
      allLocations: ["New York"],
    },
    workplaceType: "on-site",
    lists: [],
    providerMetadata: {
      provider: "lever",
      site: "acme",
    },
    raw: {},
  },
];

describe("lever filters", () => {
  it("applies keyword, location, team, department, commitment, and remote filters", () => {
    expect(
      filterLeverJobs(jobs, {
        query: "engineer",
        locations: ["remote"],
        teams: ["engineering"],
        departments: ["product"],
        commitments: ["full"],
        remoteOnly: true,
      }).map((job) => job.id),
    ).toEqual(["posting-1"]);
  });

  it("gracefully ignores absent filters", () => {
    expect(filterLeverJobs(jobs).map((job) => job.id)).toEqual(["posting-1", "posting-2"]);
  });
});
