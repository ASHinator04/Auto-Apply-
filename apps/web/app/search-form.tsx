import { Loader2, Search } from "lucide-react";
import React from "react";
import type { FormEvent } from "react";

import type { Resume } from "./resume-types";
import type { SearchFormState } from "./search-types";
import { SEARCH_EMPLOYMENT_TYPES } from "./search-utils";

export function SearchForm({
  form,
  isBusy,
  resumes,
  onChange,
  onSubmit,
}: {
  form: SearchFormState;
  isBusy: boolean;
  resumes: readonly Resume[];
  onChange: (form: SearchFormState) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form
      className="grid gap-4 border border-slate-200 bg-white p-5"
      data-testid="search-form"
      onSubmit={onSubmit}
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Keywords
          <input
            aria-required="true"
            className="border border-slate-300 px-3 py-2 text-sm"
            data-testid="search-keywords"
            maxLength={160}
            minLength={2}
            onChange={(event) => onChange({ ...form, keywords: event.target.value })}
            placeholder="software engineer"
            required
            type="search"
            value={form.keywords}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Resume
          <select
            className="border border-slate-300 bg-white px-3 py-2 text-sm"
            data-testid="search-resume"
            onChange={(event) => onChange({ ...form, resumeId: event.target.value })}
            value={form.resumeId}
          >
            <option value="">No resume selected</option>
            {resumes.map((resume) => (
              <option key={resume.id} value={resume.id}>
                {resume.displayName}
                {resume.isPrimary ? " (Primary)" : ""}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end">
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Location
          <input
            className="border border-slate-300 px-3 py-2 text-sm"
            data-testid="search-location"
            maxLength={120}
            onChange={(event) => onChange({ ...form, location: event.target.value })}
            placeholder="Remote, New York, Bengaluru"
            type="text"
            value={form.location}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Employment type
          <select
            className="border border-slate-300 bg-white px-3 py-2 text-sm"
            data-testid="search-employment-type"
            onChange={(event) =>
              onChange({
                ...form,
                employmentType: event.target.value as SearchFormState["employmentType"],
              })
            }
            value={form.employmentType}
          >
            <option value="">Any employment type</option>
            {SEARCH_EMPLOYMENT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </label>

        <label className="inline-flex min-h-10 items-center gap-2 border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700">
          <input
            checked={form.remoteOnly}
            className="h-4 w-4"
            data-testid="search-remote"
            onChange={(event) => onChange({ ...form, remoteOnly: event.target.checked })}
            type="checkbox"
          />
          Remote only
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs leading-5 text-slate-500">
          Employment type is captured for the experience but will only affect execution once the
          certified search contract supports it.
        </p>
        <button
          className="inline-flex h-10 items-center justify-center gap-2 bg-slate-900 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
          data-testid="search-submit"
          disabled={isBusy}
          type="submit"
        >
          {isBusy ? (
            <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
          ) : (
            <Search aria-hidden="true" className="h-4 w-4" />
          )}
          {isBusy ? "Searching" : "Search"}
        </button>
      </div>
    </form>
  );
}
