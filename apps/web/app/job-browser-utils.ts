import { WorkMode } from "@job-agent/contracts";

import type {
  BrowserJob,
  JobBrowserFilters,
  JobBrowserResponse,
  JobBrowserState,
  JobBrowserView,
  JobFilterOption,
  JobSortOption,
} from "./job-browser-types";

export const JOB_BROWSER_PAGE_SIZE = 10;

export function defaultJobBrowserState(): JobBrowserState {
  return {
    filters: {
      providers: [],
      remote: "all",
      employmentTypes: [],
      location: "",
    },
    sort: "relevance",
    page: 1,
    pageSize: JOB_BROWSER_PAGE_SIZE,
  };
}

export function createJobBrowserView(
  response: JobBrowserResponse,
  state: JobBrowserState,
): JobBrowserView {
  const sourceJobs =
    response.rankedJobs.length > 0 ? response.rankedJobs.map(({ job }) => job) : response.jobs;
  const relevanceOrder = new Map(
    response.rankedJobs.map(({ job, score }, index) => [job.id, { index, score }]),
  );
  const filteredJobs = filterJobs(sourceJobs, state.filters);
  const sortedJobs = sortJobs(filteredJobs, state.sort, relevanceOrder);
  const pageCount = Math.max(1, Math.ceil(sortedJobs.length / state.pageSize));
  const page = clampPage(state.page, pageCount);
  const start = (page - 1) * state.pageSize;

  return {
    jobs: sortedJobs,
    pageJobs: sortedJobs.slice(start, start + state.pageSize),
    providerOptions: providerOptions(sourceJobs),
    employmentTypeOptions: employmentTypeOptions(sourceJobs),
    totalCount: sourceJobs.length,
    filteredCount: sortedJobs.length,
    page,
    pageCount,
  };
}

export function filterJobs(jobs: readonly BrowserJob[], filters: JobBrowserFilters): BrowserJob[] {
  const providerFilter = new Set(filters.providers);
  const employmentFilter = new Set(filters.employmentTypes);
  const locationFilter = filters.location.trim().toLowerCase();

  return jobs.filter((job) => {
    if (providerFilter.size > 0 && !providerFilter.has(job.providerId)) {
      return false;
    }

    if (filters.remote === "remote" && !isRemoteJob(job)) {
      return false;
    }

    if (filters.remote === "not_remote" && isRemoteJob(job)) {
      return false;
    }

    if (employmentFilter.size > 0 && !employmentFilter.has(job.employmentType ?? "")) {
      return false;
    }

    if (locationFilter && !locationText(job).includes(locationFilter)) {
      return false;
    }

    return true;
  });
}

export function sortJobs(
  jobs: readonly BrowserJob[],
  sort: JobSortOption,
  relevanceOrder = new Map<string, { index: number; score: number }>(),
): BrowserJob[] {
  return [...jobs].sort((left, right) => {
    if (sort === "newest") {
      return compareNewest(left, right);
    }

    if (sort === "company") {
      return (
        compareText(left.companyName, right.companyName) || compareText(left.title, right.title)
      );
    }

    if (sort === "title") {
      return (
        compareText(left.title, right.title) || compareText(left.companyName, right.companyName)
      );
    }

    return compareRelevance(left, right, relevanceOrder);
  });
}

export function toggleSelection(selectedIds: ReadonlySet<string>, jobId: string): Set<string> {
  const nextSelected = new Set(selectedIds);
  if (nextSelected.has(jobId)) {
    nextSelected.delete(jobId);
  } else {
    nextSelected.add(jobId);
  }
  return nextSelected;
}

export function selectVisibleJobs(
  selectedIds: ReadonlySet<string>,
  visibleJobs: readonly BrowserJob[],
): Set<string> {
  const nextSelected = new Set(selectedIds);
  visibleJobs.forEach((job) => nextSelected.add(job.id));
  return nextSelected;
}

export function clearSelection(): Set<string> {
  return new Set();
}

export function selectedVisibleCount(
  selectedIds: ReadonlySet<string>,
  visibleJobs: readonly BrowserJob[],
): number {
  return visibleJobs.filter((job) => selectedIds.has(job.id)).length;
}

function providerOptions(jobs: readonly BrowserJob[]): JobFilterOption[] {
  return uniqueOptions(
    jobs.map((job) => ({
      value: job.providerId,
      label: job.metadata.providerName || job.providerId,
    })),
  );
}

function employmentTypeOptions(jobs: readonly BrowserJob[]): JobFilterOption[] {
  return uniqueOptions(
    jobs
      .filter((job) => Boolean(job.employmentType))
      .map((job) => ({
        value: job.employmentType ?? "",
        label: formatValue(job.employmentType ?? ""),
      })),
  );
}

function uniqueOptions(options: readonly JobFilterOption[]): JobFilterOption[] {
  const seen = new Set<string>();
  return options
    .filter((option) => {
      if (seen.has(option.value)) {
        return false;
      }
      seen.add(option.value);
      return true;
    })
    .sort((left, right) => compareText(left.label, right.label));
}

function compareRelevance(
  left: BrowserJob,
  right: BrowserJob,
  relevanceOrder: ReadonlyMap<string, { index: number; score: number }>,
): number {
  const leftRank = relevanceOrder.get(left.id);
  const rightRank = relevanceOrder.get(right.id);
  if (leftRank && rightRank) {
    return rightRank.score - leftRank.score || leftRank.index - rightRank.index;
  }
  if (leftRank) {
    return -1;
  }
  if (rightRank) {
    return 1;
  }
  return compareNewest(left, right);
}

function compareNewest(left: BrowserJob, right: BrowserJob): number {
  return timestamp(right) - timestamp(left) || compareText(left.companyName, right.companyName);
}

function compareText(left: string, right: string): number {
  return left.localeCompare(right, undefined, { sensitivity: "base" });
}

function timestamp(job: BrowserJob): number {
  return Date.parse(job.postedAt ?? job.discoveredAt) || 0;
}

function isRemoteJob(job: BrowserJob): boolean {
  return job.workMode === WorkMode.Remote || job.locations.some((location) => location.remote);
}

function locationText(job: BrowserJob): string {
  return job.locations
    .flatMap((location) => [location.label, location.city, location.region, location.country])
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function formatValue(value: string): string {
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function clampPage(page: number, pageCount: number): number {
  if (page < 1) {
    return 1;
  }
  if (page > pageCount) {
    return pageCount;
  }
  return page;
}
