"use client";

import { CheckSquare, X } from "lucide-react";
import React from "react";
import { useEffect, useMemo, useState } from "react";

import { JobBrowserControls, JobBrowserPagination } from "./job-browser-controls";
import { JobCard } from "./job-card";
import type { JobBrowserResponse, JobBrowserState } from "./job-browser-types";
import {
  clearSelection,
  createJobBrowserView,
  defaultJobBrowserState,
  selectVisibleJobs,
  selectedVisibleCount,
  toggleSelection,
} from "./job-browser-utils";

export function JobBrowser({ response }: { response: JobBrowserResponse }) {
  const [browserState, setBrowserState] = useState<JobBrowserState>(() => defaultJobBrowserState());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const view = useMemo(
    () => createJobBrowserView(response, browserState),
    [browserState, response],
  );
  const visibleSelectedCount = selectedVisibleCount(selectedIds, view.pageJobs);
  const allVisibleSelected =
    view.pageJobs.length > 0 && visibleSelectedCount === view.pageJobs.length;

  useEffect(() => {
    setSelectedIds(new Set());
  }, [response]);

  return (
    <section className="grid gap-4 border border-slate-200 bg-white p-5" data-testid="job-browser">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
        <div>
          <p className="text-xs font-semibold uppercase text-sky-700">Phase 4.2</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-950">Job Browser</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Browse, filter, sort, and select jobs from the unified search response.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <button
            className="inline-flex h-9 items-center gap-2 border border-slate-300 px-3 font-medium text-slate-700 disabled:cursor-not-allowed disabled:text-slate-400"
            data-testid="job-browser-select-visible"
            disabled={view.pageJobs.length === 0 || allVisibleSelected}
            onClick={() => setSelectedIds((current) => selectVisibleJobs(current, view.pageJobs))}
            type="button"
          >
            <CheckSquare aria-hidden="true" className="h-4 w-4" />
            Select visible
          </button>
          <button
            className="inline-flex h-9 items-center gap-2 border border-slate-300 px-3 font-medium text-slate-700 disabled:cursor-not-allowed disabled:text-slate-400"
            data-testid="job-browser-clear-selection"
            disabled={selectedIds.size === 0}
            onClick={() => setSelectedIds(clearSelection())}
            type="button"
          >
            <X aria-hidden="true" className="h-4 w-4" />
            Clear selection
          </button>
        </div>
      </div>

      <JobBrowserControls
        browserState={browserState}
        employmentTypeOptions={view.employmentTypeOptions}
        onChange={setBrowserState}
        providerOptions={view.providerOptions}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 border-y border-slate-200 py-3 text-sm text-slate-600">
        <span data-testid="job-browser-count">
          Showing {view.pageJobs.length} of {view.filteredCount} matching jobs
          {view.filteredCount !== view.totalCount ? ` (${view.totalCount} total)` : ""}.
        </span>
        <span data-testid="job-browser-selection-count">{selectedIds.size} selected</span>
      </div>

      {view.pageJobs.length === 0 ? (
        <div className="border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
          No jobs match the current browser filters.
        </div>
      ) : (
        <div className="grid gap-3">
          {view.pageJobs.map((job) => (
            <JobCard
              isSelected={selectedIds.has(job.id)}
              job={job}
              key={job.id}
              onToggle={() => setSelectedIds((current) => toggleSelection(current, job.id))}
            />
          ))}
        </div>
      )}

      <JobBrowserPagination
        browserState={browserState}
        onChange={setBrowserState}
        page={view.page}
        pageCount={view.pageCount}
      />
    </section>
  );
}
