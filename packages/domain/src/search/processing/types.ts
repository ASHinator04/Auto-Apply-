import type { EntityId, JobSearchInput, ProviderType } from "@job-agent/contracts";
import { WorkMode } from "@job-agent/contracts";

export type ProcessingStageName =
  | "aggregation"
  | "normalization"
  | "validation"
  | "deduplication"
  | "quality_filtering"
  | "ranking"
  | "response";

export interface RawProviderResultCollection {
  providerId: EntityId;
  providerType: ProviderType;
  providerName: string;
  providerPriority?: number;
  status?: "succeeded" | "failed" | "timed_out";
  durationMs?: number;
  totalFound?: number;
  jobs: readonly unknown[];
}

export interface AggregatedRawJob {
  providerId: EntityId;
  providerType: ProviderType;
  providerName: string;
  providerPriority: number;
  collectionIndex: number;
  jobIndex: number;
  rawJob: unknown;
}

export interface CanonicalJobLocation {
  label?: string;
  city?: string;
  region?: string;
  country?: string;
  remote: boolean;
}

export interface CanonicalJobCompensation {
  summary?: string;
  currency?: string;
  minAmount?: number;
  maxAmount?: number;
  interval?: string;
}

export interface CanonicalJobMetadata {
  providerId: EntityId;
  providerType: ProviderType;
  providerName: string;
  sourceBoard?: string;
  sourceFields: Record<string, string | number | boolean | null | undefined>;
}

export interface CanonicalJob {
  id: EntityId;
  providerId: EntityId;
  providerType: ProviderType;
  providerJobId: string;
  sourceUrl: string;
  title: string;
  companyName: string;
  description?: string;
  locations: CanonicalJobLocation[];
  workMode: WorkMode;
  department?: string;
  team?: string;
  employmentType?: string;
  compensation?: CanonicalJobCompensation;
  postedAt?: string;
  discoveredAt: string;
  metadata: CanonicalJobMetadata;
}

export type ValidationSeverity = "error" | "warning";

export interface JobValidationError {
  stage: "validation" | "quality_filtering";
  severity: ValidationSeverity;
  code: string;
  message: string;
  providerId?: EntityId;
  providerType?: ProviderType;
  providerJobId?: string;
  sourceUrl?: string;
}

export interface ValidationResult {
  validJobs: CanonicalJob[];
  errors: JobValidationError[];
}

export interface DeduplicationDecision {
  duplicateJobId: EntityId;
  keptJobId: EntityId;
  reason: string;
}

export interface DeduplicationResult {
  jobs: CanonicalJob[];
  removed: DeduplicationDecision[];
}

export interface QualityFilteringResult {
  jobs: CanonicalJob[];
  errors: JobValidationError[];
}

export interface RankedJob {
  job: CanonicalJob;
  score: number;
  signals: {
    keyword: number;
    recency: number;
    providerPriority: number;
  };
}

export interface ProviderProcessingStatistics {
  providerId: EntityId;
  providerType: ProviderType;
  providerName: string;
  status: "succeeded" | "failed" | "timed_out";
  rawCount: number;
  normalizedCount: number;
  validCount: number;
  returnedCount: number;
  durationMs?: number;
}

export interface ProcessingStageTiming {
  stage: ProcessingStageName;
  durationMs: number;
}

export interface ProcessingStatistics {
  rawCount: number;
  aggregatedCount: number;
  normalizedCount: number;
  validCount: number;
  deduplicatedCount: number;
  qualityFilteredCount: number;
  returnedCount: number;
  validationErrorCount: number;
  duplicateCount: number;
  stageTimings: ProcessingStageTiming[];
}

export interface UnifiedSearchResponse {
  request: JobSearchInput;
  jobs: CanonicalJob[];
  rankedJobs: RankedJob[];
  providerStatistics: ProviderProcessingStatistics[];
  processing: ProcessingStatistics;
  validation: {
    errors: JobValidationError[];
  };
  deduplication: {
    removed: DeduplicationDecision[];
  };
  createdAt: string;
}

export type ProcessingClock = () => string;
export type ProcessingDurationClock = () => number;
