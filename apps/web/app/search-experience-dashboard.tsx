"use client";

import { Search } from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

import { recordActivity } from "./activity-log-store";
import { JobBrowser } from "./job-browser";
import { listResumes } from "./resume-api";
import type { Resume } from "./resume-types";
import { executeSearch } from "./search-api";
import { SearchEmptyState } from "./search-empty-state";
import { SearchErrorState } from "./search-error-state";
import { SearchForm } from "./search-form";
import { SearchResponseSummary } from "./search-response-summary";
import {
  createAndActivateSearchSession,
  createEmptySearchSessionState,
  deactivateActiveSearchSession,
  getActiveSearchSession,
  updateSearchSession,
  type SearchSession,
} from "./search-session";
import type { SearchFormState, SearchRequestStatus } from "./search-types";
import {
  createSearchExecutionRequest,
  emptySearchFormState,
  validateSearchForm,
} from "./search-utils";

export function SearchExperienceDashboard() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [form, setForm] = useState<SearchFormState>(emptySearchFormState());
  const [status, setStatus] = useState<SearchRequestStatus>("idle");
  const [sessionState, setSessionState] = useState(() => createEmptySearchSessionState());
  const [error, setError] = useState<string | null>(null);
  const [resumeLoadError, setResumeLoadError] = useState<string | null>(null);
  const errorPanelRef = useRef<HTMLElement | null>(null);
  const activeSession = useMemo(() => getActiveSearchSession(sessionState), [sessionState]);

  useEffect(() => {
    void refreshResumes();
  }, []);

  useEffect(() => {
    if (error) {
      errorPanelRef.current?.focus();
    }
  }, [error]);

  async function refreshResumes() {
    try {
      const nextResumes = await listResumes();
      setResumes(nextResumes);
      setResumeLoadError(null);
      const primaryResume = nextResumes.find((resume) => resume.isPrimary);
      if (primaryResume) {
        setForm((current) => ({
          ...current,
          resumeId: current.resumeId || primaryResume.id,
        }));
      }
    } catch (caught) {
      setResumeLoadError(errorMessage(caught));
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runSearch();
  }

  async function runSearch() {
    const validationError = validateSearchForm(form);
    if (validationError) {
      setError(validationError);
      setStatus("error");
      recordActivity({
        area: "search",
        level: "error",
        message: "Search validation failed.",
        detail: validationError,
      });
      return;
    }

    setStatus("loading");
    setError(null);
    setSessionState((current) => deactivateActiveSearchSession(current));

    try {
      const request = createSearchExecutionRequest(form);
      const nextResponse = await executeSearch(request);
      setSessionState((current) =>
        createAndActivateSearchSession(current, {
          request,
          response: nextResponse,
        }),
      );
      setStatus("success");
    } catch (caught) {
      setError(errorMessage(caught));
      setStatus("error");
    }
  }

  function handleSessionChange(session: SearchSession) {
    setSessionState((current) => updateSearchSession(current, session));
  }

  const selectedResume = useMemo(
    () => resumes.find((resume) => resume.id === form.resumeId),
    [form.resumeId, resumes],
  );

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-2 border-b border-slate-200 pb-5">
        <p className="text-sm font-medium uppercase text-sky-700">Phase 4.4</p>
        <h1 className="text-3xl font-semibold">Search Experience</h1>
        <p className="max-w-3xl text-sm leading-6 text-slate-600">
          Run a search against the certified unified boundary, then browse and select jobs from the
          active search session.
        </p>
      </header>

      <SearchForm
        form={form}
        isBusy={status === "loading"}
        onChange={setForm}
        onSubmit={(event) => {
          void handleSubmit(event);
        }}
        resumes={resumes}
      />

      {selectedResume ? (
        <p className="border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-800">
          Search will use resume override: <strong>{selectedResume.displayName}</strong>.
        </p>
      ) : null}

      {resumeLoadError ? (
        <p
          aria-live="polite"
          className="border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          Resumes could not be loaded. You can still test the search flow.
        </p>
      ) : null}

      {error ? (
        <SearchErrorState
          message={error}
          onRetry={() => {
            void runSearch();
          }}
          panelRef={errorPanelRef}
        />
      ) : null}

      {status === "idle" ? <SearchEmptyState /> : null}
      <SearchResponseSummary response={activeSession?.response ?? null} status={status} />
      {status === "success" && activeSession && activeSession.response.jobs.length > 0 ? (
        <JobBrowser
          key={activeSession.id}
          onSessionChange={handleSessionChange}
          session={activeSession}
        />
      ) : null}

      <footer className="flex items-center gap-2 text-xs text-slate-500">
        <Search aria-hidden="true" className="h-4 w-4" />
        Phase 4.4 creates in-memory search sessions. Application queues, tracking, and automation
        are not included.
      </footer>
    </section>
  );
}

function errorMessage(caught: unknown): string {
  if (caught instanceof Error) {
    return caught.message;
  }
  return "Search operation failed.";
}
