import { describe, expect, it } from "vitest";

import { createResponse } from "./job-browser-utils.test";
import {
  clearSessionSelection,
  createAndActivateSearchSession,
  createEmptySearchSessionState,
  createSearchSession,
  deactivateActiveSearchSession,
  getActiveSearchSession,
  getSearchSession,
  isJobSelectedInSession,
  selectJobsInSession,
  toggleSessionJobSelection,
  updateSearchSession,
} from "./search-session";
import type { SearchExecutionRequest } from "./search-types";

describe("search sessions", () => {
  it("creates a session with request, response, timestamp, status, and metadata", () => {
    const session = createSearchSession({
      id: "session-1",
      now: () => "2026-07-02T10:00:00.000Z",
      request: createRequest(),
      response: createResponse(3),
    });

    expect(session).toMatchObject({
      id: "session-1",
      request: createRequest(),
      searchTimestamp: "2026-07-02T10:00:00.000Z",
      status: "completed",
      selectedJobIds: [],
      metadata: {
        resultCount: 3,
        rankedCount: 3,
        providerCount: 0,
        validationErrorCount: 0,
        selectedCount: 0,
      },
    });
  });

  it("creates, activates, retrieves, updates, and deactivates sessions", () => {
    const initialState = createEmptySearchSessionState();
    const state = createAndActivateSearchSession(initialState, {
      id: "session-1",
      request: createRequest(),
      response: createResponse(2),
    });
    const activeSession = getActiveSearchSession(state);

    expect(activeSession?.id).toBe("session-1");
    expect(getSearchSession(state, "session-1")?.response.jobs).toHaveLength(2);

    if (!activeSession) {
      throw new Error("Expected an active session.");
    }

    const selectedSession = toggleSessionJobSelection(activeSession, "job-1");
    const updatedState = updateSearchSession(state, selectedSession);

    expect(getSearchSession(updatedState, "session-1")?.selectedJobIds).toEqual(["job-1"]);
    expect(getActiveSearchSession(deactivateActiveSearchSession(updatedState))).toBeNull();
  });

  it("keeps selection in the session and ignores unknown job ids", () => {
    const session = createSearchSession({
      id: "session-1",
      request: createRequest(),
      response: createResponse(3),
    });

    const selected = selectJobsInSession(session, ["job-2", "missing", "job-1"]);

    expect(selected.selectedJobIds).toEqual(["job-1", "job-2"]);
    expect(selected.metadata.selectedCount).toBe(2);
    expect(isJobSelectedInSession(selected, "job-2")).toBe(true);
    expect(isJobSelectedInSession(selected, "missing")).toBe(false);

    const deselected = toggleSessionJobSelection(selected, "job-1");
    expect(deselected.selectedJobIds).toEqual(["job-2"]);

    const cleared = clearSessionSelection(deselected);
    expect(cleared.selectedJobIds).toEqual([]);
    expect(cleared.metadata.selectedCount).toBe(0);
  });

  it("leaves state unchanged when updating an unknown session", () => {
    const state = createEmptySearchSessionState();
    const session = createSearchSession({
      id: "session-unknown",
      request: createRequest(),
      response: createResponse(1),
    });

    expect(updateSearchSession(state, session)).toBe(state);
  });
});

function createRequest(): SearchExecutionRequest {
  return {
    keywords: "engineer",
    location: "Remote",
    remoteOnly: true,
    resumeId: "resume-1",
  };
}
