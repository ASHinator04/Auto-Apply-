import type {
  EntityId,
  Job,
  JobAgentError,
  JobSearchInput,
  ProviderType,
  SearchResult,
} from "@job-agent/contracts";

export enum SearchLifecycleStage {
  Created = "created",
  ProviderSelection = "provider_selection",
  ProviderExecution = "provider_execution",
  ResultCollection = "result_collection",
  Completed = "completed",
}

export interface SearchLifecycleEvent {
  stage: SearchLifecycleStage;
  timestamp: string;
  message: string;
  providerId?: EntityId;
}

export interface SearchProviderRequest {
  input: JobSearchInput;
  timeoutMs: number;
}

export interface SearchProviderResponse {
  jobs: Job[];
}

export interface SearchProvider {
  id: EntityId;
  type: ProviderType;
  name: string;
  enabled?: boolean;
  search(request: SearchProviderRequest): Promise<SearchProviderResponse>;
}

export type SearchProviderExecutionStatus = "succeeded" | "failed" | "timed_out";

export interface SearchProviderExecution {
  providerId: EntityId;
  providerType: ProviderType;
  providerName: string;
  status: SearchProviderExecutionStatus;
  jobs: Job[];
  durationMs: number;
  error?: JobAgentError;
}

export interface SearchExecutionResult {
  result: SearchResult;
  providerExecutions: SearchProviderExecution[];
  lifecycle: SearchLifecycleEvent[];
}

export type SearchClock = () => string;
export type SearchDurationClock = () => number;
export type SearchIdGenerator = (prefix: string) => EntityId;
