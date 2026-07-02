import { ArrowLeft, CheckSquare, ExternalLink, Square } from "lucide-react";
import React from "react";

import {
  formatCompensation,
  formatDate,
  formatLocations,
  formatOptional,
  formatWorkMode,
} from "./job-format";
import type { BrowserJob } from "./job-browser-types";

export function JobDetails({
  isSelected,
  job,
  onBack,
  onToggleSelection,
}: {
  isSelected: boolean;
  job: BrowserJob;
  onBack: () => void;
  onToggleSelection: () => void;
}) {
  const sourceFields = sourceFieldEntries(job);

  return (
    <section className="grid gap-5 border border-slate-200 bg-white p-5" data-testid="job-details">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          className="inline-flex h-9 items-center gap-2 border border-slate-300 px-3 text-sm font-semibold text-slate-700"
          data-testid="job-details-back"
          onClick={onBack}
          type="button"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Back to Browser
        </button>
        <button
          aria-pressed={isSelected}
          className="inline-flex h-9 items-center gap-2 border border-slate-300 px-3 text-sm font-semibold text-slate-700"
          data-testid="job-details-select"
          onClick={onToggleSelection}
          type="button"
        >
          {isSelected ? (
            <CheckSquare aria-hidden="true" className="h-4 w-4" />
          ) : (
            <Square aria-hidden="true" className="h-4 w-4" />
          )}
          {isSelected ? "Deselect job" : "Select job"}
        </button>
      </div>

      <header className="border-b border-slate-200 pb-4">
        <p className="text-xs font-semibold uppercase text-sky-700">Job Details</p>
        <h2 className="mt-1 text-3xl font-semibold text-slate-950">{job.title}</h2>
        <p className="mt-2 text-base font-medium text-slate-700">{job.companyName}</p>
      </header>

      <dl className="grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-3">
        <DetailItem label="Location" value={formatLocations(job)} />
        <DetailItem label="Remote Status" value={formatWorkMode(job)} />
        <DetailItem label="Employment Type" value={formatOptional(job.employmentType)} />
        <DetailItem label="Provider" value={job.metadata.providerName || job.providerId} />
        <DetailItem label="Posted Date" value={formatDate(job.postedAt)} />
        <DetailItem label="Discovered Date" value={formatDate(job.discoveredAt)} />
        <DetailItem label="Department" value={formatOptional(job.department)} />
        <DetailItem label="Team" value={formatOptional(job.team)} />
        <DetailItem label="Salary" value={formatCompensation(job)} />
        <DetailItem label="Provider Job ID" value={job.providerJobId} />
        <DetailItem label="Source Board" value={formatOptional(job.metadata.sourceBoard)} />
      </dl>

      <section className="grid gap-2">
        <h3 className="text-sm font-semibold uppercase text-slate-500">External Apply URL</h3>
        <a
          className="inline-flex w-fit items-center gap-2 break-all text-sm font-semibold text-sky-700 underline"
          data-testid="job-details-source-url"
          href={job.sourceUrl}
          rel="noreferrer"
          target="_blank"
        >
          {job.sourceUrl}
          <ExternalLink aria-hidden="true" className="h-4 w-4 shrink-0" />
        </a>
      </section>

      <section className="grid gap-2">
        <h3 className="text-sm font-semibold uppercase text-slate-500">Full Description</h3>
        {job.description ? (
          <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{job.description}</p>
        ) : (
          <p className="text-sm text-slate-500">No description was provided by the source.</p>
        )}
      </section>

      {sourceFields.length > 0 ? (
        <section className="grid gap-2">
          <h3 className="text-sm font-semibold uppercase text-slate-500">
            Available Source Fields
          </h3>
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            {sourceFields.map(([key, value]) => (
              <DetailItem key={key} label={key} value={String(value)} />
            ))}
          </dl>
        </section>
      ) : null}
    </section>
  );
}

export function JobDetailsMissing({ onBack }: { onBack: () => void }) {
  return (
    <section
      className="grid gap-3 border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900"
      data-testid="job-details-missing"
    >
      <h2 className="text-base font-semibold">Job could not be found</h2>
      <p>The selected job is no longer available in the current search results.</p>
      <button
        className="inline-flex h-9 w-fit items-center gap-2 border border-amber-300 bg-white px-3 font-semibold"
        onClick={onBack}
        type="button"
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        Back to Browser
      </button>
    </section>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-slate-200 bg-slate-50 px-3 py-2">
      <dt className="text-xs font-semibold uppercase text-slate-500">{formatLabel(label)}</dt>
      <dd className="mt-1 break-words text-slate-800">{value}</dd>
    </div>
  );
}

function sourceFieldEntries(job: BrowserJob): [string, string | number | boolean][] {
  return Object.entries(job.metadata.sourceFields)
    .filter(([, value]) => value !== null && value !== undefined && value !== "")
    .filter(([, value]) => ["string", "number", "boolean"].includes(typeof value))
    .slice(0, 12) as [string, string | number | boolean][];
}

function formatLabel(value: string): string {
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
