import type { UnifiedSearchResponse } from "@job-agent/domain";

import type { SearchExecutionRequest } from "./search-types";

export type SearchSessionStatus = "completed";

export interface SearchSessionMetadata {
  resultCount: number;
  rankedCount: number;
  providerCount: number;
  validationErrorCount: number;
  selectedCount: number;
}

export interface SearchSession {
  id: string;
  request: SearchExecutionRequest;
  searchTimestamp: string;
  status: SearchSessionStatus;
  response: UnifiedSearchResponse;
  selectedJobIds: string[];
  metadata: SearchSessionMetadata;
}

export interface SearchSessionState {
  activeSessionId: string | null;
  sessions: Record<string, SearchSession>;
}

export interface CreateSearchSessionInput {
  id?: string;
  now?: () => string;
  request: SearchExecutionRequest;
  response: UnifiedSearchResponse;
}

export function createEmptySearchSessionState(): SearchSessionState {
  return {
    activeSessionId: null,
    sessions: {},
  };
}

export function createSearchSession(input: CreateSearchSessionInput): SearchSession {
  const searchTimestamp = input.now?.() ?? new Date().toISOString();
  const session: SearchSession = {
    id: input.id ?? createSearchSessionId(searchTimestamp),
    request: { ...input.request },
    searchTimestamp,
    status: "completed",
    response: input.response,
    selectedJobIds: [],
    metadata: createSessionMetadata(input.response, []),
  };

  return session;
}

export function createAndActivateSearchSession(
  state: SearchSessionState,
  input: CreateSearchSessionInput,
): SearchSessionState {
  const session = createSearchSession(input);
  return {
    activeSessionId: session.id,
    sessions: {
      ...state.sessions,
      [session.id]: session,
    },
  };
}

export function getSearchSession(
  state: SearchSessionState,
  sessionId: string | null,
): SearchSession | null {
  if (!sessionId) {
    return null;
  }
  return state.sessions[sessionId] ?? null;
}

export function getActiveSearchSession(state: SearchSessionState): SearchSession | null {
  return getSearchSession(state, state.activeSessionId);
}

export function deactivateActiveSearchSession(state: SearchSessionState): SearchSessionState {
  if (!state.activeSessionId) {
    return state;
  }
  return {
    ...state,
    activeSessionId: null,
  };
}

export function updateSearchSession(
  state: SearchSessionState,
  session: SearchSession,
): SearchSessionState {
  if (!state.sessions[session.id]) {
    return state;
  }

  return {
    ...state,
    sessions: {
      ...state.sessions,
      [session.id]: session,
    },
  };
}

export function toggleSessionJobSelection(session: SearchSession, jobId: string): SearchSession {
  const selected = new Set(session.selectedJobIds);
  if (selected.has(jobId)) {
    selected.delete(jobId);
  } else {
    selected.add(jobId);
  }
  return withSelectedJobs(session, selected);
}

export function selectJobsInSession(
  session: SearchSession,
  jobIds: readonly string[],
): SearchSession {
  const selected = new Set(session.selectedJobIds);
  jobIds.forEach((jobId) => selected.add(jobId));
  return withSelectedJobs(session, selected);
}

export function clearSessionSelection(session: SearchSession): SearchSession {
  if (session.selectedJobIds.length === 0) {
    return session;
  }
  return withSelectedJobs(session, new Set());
}

export function isJobSelectedInSession(session: SearchSession, jobId: string): boolean {
  return session.selectedJobIds.includes(jobId);
}

function withSelectedJobs(
  session: SearchSession,
  selectedJobIds: ReadonlySet<string>,
): SearchSession {
  const normalizedSelectedJobIds = normalizeSelectedJobIds(session.response, selectedJobIds);
  return {
    ...session,
    selectedJobIds: normalizedSelectedJobIds,
    metadata: createSessionMetadata(session.response, normalizedSelectedJobIds),
  };
}

function normalizeSelectedJobIds(
  response: UnifiedSearchResponse,
  selectedJobIds: ReadonlySet<string>,
): string[] {
  return response.jobs.filter((job) => selectedJobIds.has(job.id)).map((job) => job.id);
}

function createSessionMetadata(
  response: UnifiedSearchResponse,
  selectedJobIds: readonly string[],
): SearchSessionMetadata {
  return {
    resultCount: response.jobs.length,
    rankedCount: response.rankedJobs.length,
    providerCount: response.providerStatistics.length,
    validationErrorCount: response.validation.errors.length,
    selectedCount: selectedJobIds.length,
  };
}

function createSearchSessionId(timestamp: string): string {
  const safeTimestamp = timestamp.replace(/[^0-9A-Za-z]+/g, "-").replace(/^-|-$/g, "");
  const randomValue =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2, 10);
  return `search-session-${safeTimestamp}-${randomValue}`;
}
