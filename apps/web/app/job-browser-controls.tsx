import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";

import type { JobBrowserState, JobFilterOption } from "./job-browser-types";

export function JobBrowserControls({
  browserState,
  employmentTypeOptions,
  onChange,
  providerOptions,
}: {
  browserState: JobBrowserState;
  employmentTypeOptions: readonly JobFilterOption[];
  onChange: (state: JobBrowserState) => void;
  providerOptions: readonly JobFilterOption[];
}) {
  const { filters } = browserState;

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
        Provider
        <select
          className="border border-slate-300 bg-white px-3 py-2 text-sm"
          data-testid="job-filter-provider"
          onChange={(event) =>
            onChange({
              ...browserState,
              page: 1,
              filters: {
                ...filters,
                providers: event.target.value ? [event.target.value] : [],
              },
            })
          }
          value={filters.providers[0] ?? ""}
        >
          <option value="">All providers</option>
          {providerOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
        Remote
        <select
          className="border border-slate-300 bg-white px-3 py-2 text-sm"
          data-testid="job-filter-remote"
          onChange={(event) =>
            onChange({
              ...browserState,
              page: 1,
              filters: { ...filters, remote: event.target.value as typeof filters.remote },
            })
          }
          value={filters.remote}
        >
          <option value="all">All work modes</option>
          <option value="remote">Remote only</option>
          <option value="not_remote">Non-remote</option>
        </select>
      </label>

      <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
        Employment Type
        <select
          className="border border-slate-300 bg-white px-3 py-2 text-sm"
          data-testid="job-filter-employment"
          onChange={(event) =>
            onChange({
              ...browserState,
              page: 1,
              filters: {
                ...filters,
                employmentTypes: event.target.value ? [event.target.value] : [],
              },
            })
          }
          value={filters.employmentTypes[0] ?? ""}
        >
          <option value="">All types</option>
          {employmentTypeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
        Location
        <input
          className="border border-slate-300 px-3 py-2 text-sm"
          data-testid="job-filter-location"
          maxLength={120}
          onChange={(event) =>
            onChange({
              ...browserState,
              page: 1,
              filters: { ...filters, location: event.target.value },
            })
          }
          placeholder="Remote, London, India"
          type="search"
          value={filters.location}
        />
      </label>

      <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 md:max-w-xs">
        Sort
        <select
          className="border border-slate-300 bg-white px-3 py-2 text-sm"
          data-testid="job-sort"
          onChange={(event) =>
            onChange({
              ...browserState,
              page: 1,
              sort: event.target.value as JobBrowserState["sort"],
            })
          }
          value={browserState.sort}
        >
          <option value="relevance">Relevance</option>
          <option value="newest">Newest</option>
          <option value="company">Company</option>
          <option value="title">Title</option>
        </select>
      </label>
    </div>
  );
}

export function JobBrowserPagination({
  browserState,
  onChange,
  page,
  pageCount,
}: {
  browserState: JobBrowserState;
  onChange: (state: JobBrowserState) => void;
  page: number;
  pageCount: number;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
      <span data-testid="job-browser-page">
        Page {page} of {pageCount}
      </span>
      <div className="flex gap-2">
        <button
          className="inline-flex h-9 items-center gap-2 border border-slate-300 px-3 font-medium text-slate-700 disabled:cursor-not-allowed disabled:text-slate-400"
          data-testid="job-browser-prev"
          disabled={page <= 1}
          onClick={() => onChange({ ...browserState, page: page - 1 })}
          type="button"
        >
          <ChevronLeft aria-hidden="true" className="h-4 w-4" />
          Previous
        </button>
        <button
          className="inline-flex h-9 items-center gap-2 border border-slate-300 px-3 font-medium text-slate-700 disabled:cursor-not-allowed disabled:text-slate-400"
          data-testid="job-browser-next"
          disabled={page >= pageCount}
          onClick={() => onChange({ ...browserState, page: page + 1 })}
          type="button"
        >
          Next
          <ChevronRight aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
