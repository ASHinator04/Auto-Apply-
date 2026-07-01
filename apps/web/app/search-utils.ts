import { EmploymentType, WorkMode } from "@job-agent/contracts";

import type { SearchApiPayload, SearchExecutionRequest, SearchFormState } from "./search-types";

export const SEARCH_EMPLOYMENT_TYPES: readonly { value: EmploymentType; label: string }[] = [
  { value: EmploymentType.Permanent, label: "Permanent" },
  { value: EmploymentType.Contract, label: "Contract" },
  { value: EmploymentType.Internship, label: "Internship" },
  { value: EmploymentType.Temporary, label: "Temporary" },
];

export function emptySearchFormState(resumeId = ""): SearchFormState {
  return {
    keywords: "",
    location: "",
    remoteOnly: false,
    employmentType: "",
    resumeId,
  };
}

export function createSearchExecutionRequest(form: SearchFormState): SearchExecutionRequest {
  const employmentType = form.employmentType === "" ? undefined : form.employmentType;

  return {
    keywords: form.keywords.trim(),
    location: form.location.trim() || undefined,
    remoteOnly: form.remoteOnly,
    employmentType,
    resumeId: form.resumeId || undefined,
  };
}

export function validateSearchForm(form: SearchFormState): string | null {
  if (!form.keywords.trim()) {
    return "Enter keywords before searching.";
  }

  if (form.keywords.trim().length < 2) {
    return "Search keywords must be at least 2 characters.";
  }

  return null;
}

export function toSearchApiPayload(request: SearchExecutionRequest): SearchApiPayload {
  return {
    query: request.keywords,
    locations: request.location ? [request.location] : undefined,
    workModes: request.remoteOnly ? [WorkMode.Remote] : undefined,
  };
}
