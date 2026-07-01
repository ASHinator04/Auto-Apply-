import { filterAshbyJobs } from "./filters";
import type { RawAshbyJob } from "./models";

const jobs: RawAshbyJob[] = [
  {
    title: "Backend Engineer",
    location: "Remote",
    secondaryLocations: [],
    department: "Engineering",
    team: "Platform",
    isRemote: true,
    workplaceType: "Remote",
    descriptionPlain: "Build APIs.",
    employmentType: "FullTime",
    providerMetadata: {
      provider: "ashby",
      jobBoardName: "acme",
    },
    raw: {},
  },
  {
    title: "Recruiter",
    location: "New York",
    secondaryLocations: [],
    department: "People",
    team: "Talent",
    isRemote: false,
    workplaceType: "OnSite",
    descriptionPlain: "Hire people.",
    employmentType: "Contract",
    providerMetadata: {
      provider: "ashby",
      jobBoardName: "acme",
    },
    raw: {},
  },
];

describe("ashby filters", () => {
  it("applies keyword, location, team, department, employment type, and remote filters", () => {
    expect(
      filterAshbyJobs(jobs, {
        query: "engineer",
        locations: ["remote"],
        teams: ["platform"],
        departments: ["engineering"],
        employmentTypes: ["full"],
        remoteOnly: true,
      }).map((job) => job.title),
    ).toEqual(["Backend Engineer"]);
  });

  it("gracefully ignores absent filters", () => {
    expect(filterAshbyJobs(jobs).map((job) => job.title)).toEqual([
      "Backend Engineer",
      "Recruiter",
    ]);
  });
});
