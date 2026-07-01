import type { CanonicalJob, UnifiedSearchResponse } from "@job-agent/domain";

export type JobBrowserResponse = UnifiedSearchResponse;
export type BrowserJob = CanonicalJob;

export type JobSortOption = "relevance" | "newest" | "company" | "title";
export type RemoteFilterOption = "all" | "remote" | "not_remote";

export interface JobBrowserFilters {
  providers: string[];
  remote: RemoteFilterOption;
  employmentTypes: string[];
  location: string;
}

export interface JobBrowserState {
  filters: JobBrowserFilters;
  sort: JobSortOption;
  page: number;
  pageSize: number;
}

export interface JobFilterOption {
  value: string;
  label: string;
}

export interface JobBrowserView {
  jobs: BrowserJob[];
  pageJobs: BrowserJob[];
  providerOptions: JobFilterOption[];
  employmentTypeOptions: JobFilterOption[];
  totalCount: number;
  filteredCount: number;
  page: number;
  pageCount: number;
}
