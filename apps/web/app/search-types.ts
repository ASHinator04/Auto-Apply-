import type { EmploymentType, WorkMode } from "@job-agent/contracts";
import type { UnifiedSearchResponse } from "@job-agent/domain";

export interface SearchFormState {
  keywords: string;
  location: string;
  remoteOnly: boolean;
  employmentType: EmploymentType | "";
  resumeId: string;
}

export interface SearchExecutionRequest {
  keywords: string;
  location?: string;
  remoteOnly: boolean;
  employmentType?: EmploymentType;
  resumeId?: string;
}

export interface SearchApiPayload {
  query: string;
  locations?: string[];
  workModes?: WorkMode[];
}

export type SearchExperienceResponse = UnifiedSearchResponse;

export type SearchRequestStatus = "idle" | "loading" | "success" | "error";
