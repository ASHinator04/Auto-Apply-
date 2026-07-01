import { BriefcaseBusiness, CheckSquare, Square } from "lucide-react";
import React from "react";

import type { BrowserJob } from "./job-browser-types";

export function JobCard({
  isSelected,
  job,
  onToggle,
}: {
  isSelected: boolean;
  job: BrowserJob;
  onToggle: () => void;
}) {
  return (
    <article className="border border-slate-200 bg-slate-50 p-4" data-testid="job-card">
      <div className="grid gap-3 sm:grid-cols-[auto_minmax(0,1fr)]">
        <button
          aria-label={`${isSelected ? "Deselect" : "Select"} ${job.title} at ${job.companyName}`}
          aria-pressed={isSelected}
          className="inline-flex h-9 w-9 items-center justify-center border border-slate-300 bg-white text-slate-700"
          data-testid="job-card-select"
          onClick={onToggle}
          type="button"
        >
          {isSelected ? (
            <CheckSquare aria-hidden="true" className="h-4 w-4" />
          ) : (
            <Square aria-hidden="true" className="h-4 w-4" />
          )}
        </button>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="min-w-0 text-lg font-semibold text-slate-950">{job.title}</h3>
            <ProviderBadge label={job.metadata.providerName || job.providerId} />
          </div>
          <p className="mt-1 text-sm font-medium text-slate-700">{job.companyName}</p>
          <dl className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryItem label="Location" value={formatLocations(job)} />
            <SummaryItem label="Posted" value={formatDate(job.postedAt)} />
            <SummaryItem label="Type" value={formatOptional(job.employmentType)} />
            <SummaryItem label="Work Mode" value={formatWorkMode(job)} />
          </dl>
        </div>
      </div>
    </article>
  );
}

function ProviderBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 border border-sky-200 bg-sky-50 px-2 py-1 text-xs font-semibold text-sky-800">
      <BriefcaseBusiness aria-hidden="true" className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase text-slate-500">{label}</dt>
      <dd className="mt-0.5 break-words text-slate-700">{value}</dd>
    </div>
  );
}

function formatLocations(job: BrowserJob): string {
  const locations = job.locations.map((location) => location.label).filter(Boolean);
  return locations.length > 0 ? locations.join(", ") : "Not listed";
}

function formatDate(value: string | undefined): string {
  if (!value) {
    return "Not listed";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Not listed";
  }
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(date);
}

function formatOptional(value: string | undefined): string {
  return value ? value : "Not listed";
}

function formatWorkMode(job: BrowserJob): string {
  if (job.workMode === "remote" || job.locations.some((location) => location.remote)) {
    return "Remote";
  }
  if (job.workMode === "hybrid") {
    return "Hybrid";
  }
  if (job.workMode === "onsite") {
    return "On-site";
  }
  return "Not listed";
}
