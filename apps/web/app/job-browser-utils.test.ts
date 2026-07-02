import { ProviderType, WorkMode, type JobSearchInput } from "@job-agent/contracts";
import type { CanonicalJob, UnifiedSearchResponse } from "@job-agent/domain";
import { describe, expect, it } from "vitest";

import {
  createJobBrowserView,
  defaultJobBrowserState,
  filterJobs,
  selectVisibleJobs,
  sortJobs,
  toggleSelection,
} from "./job-browser-utils";

describe("job browser utilities", () => {
  it("filters jobs by provider, remote state, employment type, and location", () => {
    const jobs = createJobs();

    expect(
      filterJobs(jobs, {
        providers: ["greenhouse"],
        remote: "remote",
        employmentTypes: ["Full-time"],
        location: "remote",
      }).map((job) => job.id),
    ).toEqual(["job-1"]);
  });

  it("sorts by relevance, newest, company, and title", () => {
    const jobs = createJobs();
    const relevance = new Map([
      ["job-2", { index: 0, score: 100 }],
      ["job-1", { index: 1, score: 80 }],
    ]);

    expect(sortJobs(jobs, "relevance", relevance).map((job) => job.id)).toEqual([
      "job-2",
      "job-1",
      "job-3",
    ]);
    expect(sortJobs(jobs, "newest").map((job) => job.id)).toEqual(["job-2", "job-1", "job-3"]);
    expect(sortJobs(jobs, "company").map((job) => job.companyName)).toEqual([
      "Alpha",
      "Beta",
      "Gamma",
    ]);
    expect(sortJobs(jobs, "title").map((job) => job.title)).toEqual([
      "Backend Engineer",
      "Frontend Engineer",
      "Platform Engineer",
    ]);
  });

  it("uses stable job id tie-breakers for identical sort fields", () => {
    const jobs = createJobs(2);
    const first = jobs[0];
    const second = jobs[1];
    if (!first || !second) {
      throw new Error("Expected at least two job fixtures.");
    }
    const tiedJobs: CanonicalJob[] = [
      {
        ...second,
        id: "job-b",
        title: "Engineer",
        companyName: "Same Company",
        postedAt: "2026-06-01T00:00:00.000Z",
      },
      {
        ...first,
        id: "job-a",
        title: "Engineer",
        companyName: "Same Company",
        postedAt: "2026-06-01T00:00:00.000Z",
      },
    ];

    expect(sortJobs(tiedJobs, "newest").map((job) => job.id)).toEqual(["job-a", "job-b"]);
    expect(sortJobs(tiedJobs, "company").map((job) => job.id)).toEqual(["job-a", "job-b"]);
    expect(sortJobs(tiedJobs, "title").map((job) => job.id)).toEqual(["job-a", "job-b"]);
  });

  it("paginates and clamps browser pages", () => {
    const response = createResponse(12);
    const view = createJobBrowserView(response, {
      ...defaultJobBrowserState(),
      page: 2,
      pageSize: 10,
    });

    expect(view.page).toBe(2);
    expect(view.pageCount).toBe(2);
    expect(view.pageJobs).toHaveLength(2);

    const clampedView = createJobBrowserView(response, {
      ...defaultJobBrowserState(),
      page: 99,
      pageSize: 10,
    });
    expect(clampedView.page).toBe(2);

    const safePageSizeView = createJobBrowserView(response, {
      ...defaultJobBrowserState(),
      page: 1,
      pageSize: 0,
    });
    expect(safePageSizeView.pageCount).toBe(2);
    expect(safePageSizeView.pageJobs).toHaveLength(10);
  });

  it("selects, deselects, and bulk selects visible jobs predictably", () => {
    const jobs = createJobs();
    const selected = toggleSelection(new Set(), "job-1");

    expect([...selected]).toEqual(["job-1"]);
    expect([...toggleSelection(selected, "job-1")]).toEqual([]);
    expect([...selectVisibleJobs(selected, jobs.slice(0, 2))].sort()).toEqual(["job-1", "job-2"]);
  });
});

export function createJobs(count = 3): CanonicalJob[] {
  const baseJobs: CanonicalJob[] = [
    createJob({
      id: "job-1",
      providerId: "greenhouse",
      title: "Platform Engineer",
      companyName: "Gamma",
      location: "Remote",
      remote: true,
      employmentType: "Full-time",
      postedAt: "2026-06-01T00:00:00.000Z",
      workMode: WorkMode.Remote,
    }),
    createJob({
      id: "job-2",
      providerId: "lever",
      title: "Backend Engineer",
      companyName: "Alpha",
      location: "New York",
      remote: false,
      employmentType: "Contract",
      postedAt: "2026-06-03T00:00:00.000Z",
      workMode: WorkMode.Onsite,
    }),
    createJob({
      id: "job-3",
      providerId: "ashby",
      title: "Frontend Engineer",
      companyName: "Beta",
      location: "London",
      remote: false,
      employmentType: undefined,
      postedAt: "2026-05-01T00:00:00.000Z",
      workMode: WorkMode.Hybrid,
    }),
  ];

  if (count <= baseJobs.length) {
    return baseJobs.slice(0, count);
  }

  return Array.from({ length: count }, (_, index) =>
    createJob({
      id: `job-${index + 1}`,
      providerId: index % 2 === 0 ? "greenhouse" : "lever",
      title: `Engineer ${index + 1}`,
      companyName: `Company ${index + 1}`,
      location: index % 2 === 0 ? "Remote" : "New York",
      remote: index % 2 === 0,
      employmentType: "Full-time",
      postedAt: `2026-06-${String(index + 1).padStart(2, "0")}T00:00:00.000Z`,
      workMode: index % 2 === 0 ? WorkMode.Remote : WorkMode.Onsite,
    }),
  );
}

export function createResponse(count = 3): UnifiedSearchResponse {
  const jobs = createJobs(count);
  const request: JobSearchInput = { userId: "local-user", query: "engineer" };

  return {
    request,
    jobs,
    rankedJobs: jobs.map((job, index) => ({
      job,
      score: jobs.length - index,
      signals: { keyword: 1, recency: 1, providerPriority: 1 },
    })),
    providerStatistics: [],
    processing: {
      rawCount: jobs.length,
      aggregatedCount: jobs.length,
      normalizedCount: jobs.length,
      validCount: jobs.length,
      deduplicatedCount: jobs.length,
      qualityFilteredCount: jobs.length,
      returnedCount: jobs.length,
      validationErrorCount: 0,
      duplicateCount: 0,
      stageTimings: [],
    },
    validation: { errors: [] },
    deduplication: { removed: [] },
    createdAt: "2026-06-10T00:00:00.000Z",
  };
}

function createJob(input: {
  id: string;
  providerId: string;
  title: string;
  companyName: string;
  location: string;
  remote: boolean;
  employmentType?: string;
  postedAt: string;
  workMode: WorkMode;
}): CanonicalJob {
  return {
    id: input.id,
    providerId: input.providerId,
    providerType: ProviderType.Other,
    providerJobId: `${input.providerId}-${input.id}`,
    sourceUrl: `https://jobs.example.com/${input.id}`,
    title: input.title,
    companyName: input.companyName,
    locations: [{ label: input.location, remote: input.remote }],
    workMode: input.workMode,
    employmentType: input.employmentType,
    postedAt: input.postedAt,
    discoveredAt: "2026-06-10T00:00:00.000Z",
    metadata: {
      providerId: input.providerId,
      providerType: ProviderType.Other,
      providerName: providerName(input.providerId),
      sourceFields: {},
    },
  };
}

function providerName(providerId: string): string {
  if (providerId === "greenhouse") {
    return "Greenhouse";
  }
  if (providerId === "lever") {
    return "Lever";
  }
  if (providerId === "ashby") {
    return "Ashby";
  }
  return providerId;
}
