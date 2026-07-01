import { EmploymentType, WorkMode } from "@job-agent/contracts";
import { describe, expect, it } from "vitest";

import {
  createSearchExecutionRequest,
  emptySearchFormState,
  toSearchApiPayload,
  validateSearchForm,
} from "./search-utils";

describe("search form utilities", () => {
  it("validates required keywords", () => {
    expect(validateSearchForm(emptySearchFormState())).toBe("Enter keywords before searching.");
  });

  it("builds a trimmed search execution request", () => {
    const request = createSearchExecutionRequest({
      keywords: " software engineer ",
      location: " Remote ",
      remoteOnly: true,
      employmentType: EmploymentType.Contract,
      resumeId: "resume-1",
    });

    expect(request).toEqual({
      keywords: "software engineer",
      location: "Remote",
      remoteOnly: true,
      employmentType: EmploymentType.Contract,
      resumeId: "resume-1",
    });
  });

  it("maps supported fields to the search engine request payload", () => {
    const payload = toSearchApiPayload({
      keywords: "frontend",
      location: "New York",
      remoteOnly: true,
      employmentType: EmploymentType.Permanent,
      resumeId: "resume-1",
    });

    expect(payload).toEqual({
      query: "frontend",
      locations: ["New York"],
      workModes: [WorkMode.Remote],
    });
  });
});
