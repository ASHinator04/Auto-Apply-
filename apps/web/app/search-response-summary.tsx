import React from "react";

import type { SearchExperienceResponse, SearchRequestStatus } from "./search-types";

export function SearchResponseSummary({
  response,
  status,
}: {
  response: SearchExperienceResponse | null;
  status: SearchRequestStatus;
}) {
  if (status === "idle") {
    return null;
  }

  if (status === "loading") {
    return (
      <section
        aria-live="polite"
        className="border border-slate-200 bg-white p-6 text-sm text-slate-600"
        data-testid="search-loading-state"
      >
        Search is running through the unified search pipeline...
      </section>
    );
  }

  if (!response) {
    return null;
  }

  if (response.jobs.length === 0) {
    return (
      <section
        className="border border-slate-200 bg-white p-6 text-sm text-slate-600"
        data-testid="search-no-results-state"
      >
        <h2 className="font-semibold text-slate-900">No results returned</h2>
        <p className="mt-1 leading-6">
          The unified search response completed successfully, but no jobs were returned for this
          request.
        </p>
      </section>
    );
  }

  return (
    <section className="border border-slate-200 bg-white p-6" data-testid="search-success-state">
      <div className="grid gap-4 sm:grid-cols-3">
        <Metric label="Jobs returned" value={response.jobs.length.toString()} />
        <Metric label="Providers" value={response.providerStatistics.length.toString()} />
        <Metric label="Validation issues" value={response.validation.errors.length.toString()} />
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-600">
        Unified response received. Use the Job Browser below to review and select returned jobs.
      </p>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="text-2xl font-semibold text-slate-950">{value}</div>
      <div className="text-xs font-medium uppercase text-slate-500">{label}</div>
    </div>
  );
}
