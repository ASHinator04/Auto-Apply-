"use client";

import { CheckSquare, X } from "lucide-react";
import React from "react";
import { useEffect, useMemo, useState } from "react";

import { JobBrowserControls, JobBrowserPagination } from "./job-browser-controls";
import { JobCard } from "./job-card";
import { JobDetails, JobDetailsMissing } from "./job-details";
import type { JobBrowserState } from "./job-browser-types";
import {
  createJobBrowserView,
  defaultJobBrowserState,
  findJobById,
  selectedVisibleCount,
} from "./job-browser-utils";
import {
  clearSessionSelection,
  isJobSelectedInSession,
  selectJobsInSession,
  toggleSessionJobSelection,
  type SearchSession,
} from "./search-session";

export function JobBrowser({
  onSessionChange,
  session,
}: {
  onSessionChange: (session: SearchSession) => void;
  session: SearchSession;
}) {
  const [browserState, setBrowserState] = useState<JobBrowserState>(() => defaultJobBrowserState());
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const response = session.response;
  const selectedIds = useMemo(() => new Set(session.selectedJobIds), [session.selectedJobIds]);
  const view = useMemo(
    () => createJobBrowserView(response, browserState),
    [browserState, response],
  );
  const selectedJob = useMemo(
    () => findJobById(view.jobs, selectedJobId),
    [selectedJobId, view.jobs],
  );
  const visibleSelectedCount = selectedVisibleCount(selectedIds, view.pageJobs);
  const allVisibleSelected =
    view.pageJobs.length > 0 && visibleSelectedCount === view.pageJobs.length;

  useEffect(() => {
    setSelectedJobId(null);
  }, [session.id]);

  if (selectedJobId) {
    return selectedJob ? (
      <JobDetails
        isSelected={isJobSelectedInSession(session, selectedJob.id)}
        job={selectedJob}
        onBack={() => setSelectedJobId(null)}
        onToggleSelection={() =>
          onSessionChange(toggleSessionJobSelection(session, selectedJob.id))
        }
      />
    ) : (
      <JobDetailsMissing onBack={() => setSelectedJobId(null)} />
    );
  }

  return (
    <section className="grid gap-4 border border-slate-200 bg-white p-5" data-testid="job-browser">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
        <div>
          <p className="text-xs font-semibold uppercase text-sky-700">Phase 4.4</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-950">Job Browser</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Browse, filter, sort, and select jobs from the active search session.
          </p>
          <p className="mt-2 text-xs text-slate-500" data-testid="search-session-summary">
            Session {session.id} | {session.status} | {session.metadata.selectedCount} selected
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <button
            className="inline-flex h-9 items-center gap-2 border border-slate-300 px-3 font-medium text-slate-700 disabled:cursor-not-allowed disabled:text-slate-400"
            data-testid="job-browser-select-visible"
            disabled={view.pageJobs.length === 0 || allVisibleSelected}
            onClick={() =>
              onSessionChange(
                selectJobsInSession(
                  session,
                  view.pageJobs.map((job) => job.id),
                ),
              )
            }
            type="button"
          >
            <CheckSquare aria-hidden="true" className="h-4 w-4" />
            Select visible
          </button>
          <button
            className="inline-flex h-9 items-center gap-2 border border-slate-300 px-3 font-medium text-slate-700 disabled:cursor-not-allowed disabled:text-slate-400"
            data-testid="job-browser-clear-selection"
            disabled={selectedIds.size === 0}
            onClick={() => onSessionChange(clearSessionSelection(session))}
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
              isSelected={isJobSelectedInSession(session, job.id)}
              job={job}
              key={job.id}
              onOpen={() => setSelectedJobId(job.id)}
              onToggle={() => onSessionChange(toggleSessionJobSelection(session, job.id))}
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
