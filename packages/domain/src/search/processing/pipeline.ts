import type { JobSearchInput } from "@job-agent/contracts";

import { aggregateProviderResults } from "./aggregation";
import { deduplicateJobs } from "./deduplication";
import { normalizeAggregatedJobs } from "./normalization";
import { filterLowQualityJobs } from "./quality-filter";
import { rankJobs } from "./ranking";
import {
  type CanonicalJob,
  type ProcessingClock,
  type ProcessingDurationClock,
  type ProcessingStageName,
  type ProcessingStageTiming,
  type ProviderProcessingStatistics,
  type RawProviderResultCollection,
  type UnifiedSearchResponse,
} from "./types";
import { validateCanonicalJobs } from "./validation";

export interface SearchResultProcessingInput {
  request: JobSearchInput;
  providerResults: readonly RawProviderResultCollection[];
}

export interface SearchResultProcessingPipelineDependencies {
  clock?: ProcessingClock;
  durationClock?: ProcessingDurationClock;
}

export class SearchResultProcessingPipeline {
  private readonly clock: ProcessingClock;
  private readonly durationClock: ProcessingDurationClock;

  constructor(dependencies: SearchResultProcessingPipelineDependencies = {}) {
    this.clock = dependencies.clock ?? (() => new Date().toISOString());
    this.durationClock = dependencies.durationClock ?? (() => Date.now());
  }

  process(input: SearchResultProcessingInput): UnifiedSearchResponse {
    const createdAt = this.clock();
    const timings: ProcessingStageTiming[] = [];

    const aggregated = this.measure("aggregation", timings, () =>
      aggregateProviderResults(input.providerResults),
    );
    const normalized = this.measure("normalization", timings, () =>
      normalizeAggregatedJobs(aggregated, { discoveredAt: createdAt }),
    );
    const validation = this.measure("validation", timings, () => validateCanonicalJobs(normalized));
    const deduplication = this.measure("deduplication", timings, () =>
      deduplicateJobs(validation.validJobs),
    );
    const qualityFiltering = this.measure("quality_filtering", timings, () =>
      filterLowQualityJobs(deduplication.jobs),
    );
    const rankedJobs = this.measure("ranking", timings, () =>
      rankJobs(qualityFiltering.jobs, input.request, {
        now: createdAt,
        providerPriorities: createProviderPriorityMap(input.providerResults),
      }),
    );
    const jobs = rankedJobs.map((rankedJob) => rankedJob.job);

    this.measure("response", timings, () => undefined);

    return {
      request: input.request,
      jobs,
      rankedJobs,
      providerStatistics: createProviderStatistics(
        input.providerResults,
        normalized,
        validation.validJobs,
        jobs,
      ),
      processing: {
        rawCount: input.providerResults.reduce((total, result) => total + result.jobs.length, 0),
        aggregatedCount: aggregated.length,
        normalizedCount: normalized.length,
        validCount: validation.validJobs.length,
        deduplicatedCount: deduplication.jobs.length,
        qualityFilteredCount: qualityFiltering.jobs.length,
        returnedCount: jobs.length,
        validationErrorCount: validation.errors.length + qualityFiltering.errors.length,
        duplicateCount: deduplication.removed.length,
        stageTimings: timings,
      },
      validation: {
        errors: [...validation.errors, ...qualityFiltering.errors],
      },
      deduplication: {
        removed: deduplication.removed,
      },
      createdAt,
    };
  }

  private measure<T>(
    stage: ProcessingStageName,
    timings: ProcessingStageTiming[],
    action: () => T,
  ): T {
    const startedAt = this.durationClock();
    const result = action();
    timings.push({
      stage,
      durationMs: Math.max(0, this.durationClock() - startedAt),
    });
    return result;
  }
}

function createProviderPriorityMap(
  providerResults: readonly RawProviderResultCollection[],
): Map<string, number> {
  return new Map(
    providerResults.map((result) => [result.providerId, result.providerPriority ?? 1_000]),
  );
}

function createProviderStatistics(
  providerResults: readonly RawProviderResultCollection[],
  normalizedJobs: readonly CanonicalJob[],
  validJobs: readonly CanonicalJob[],
  returnedJobs: readonly CanonicalJob[],
): ProviderProcessingStatistics[] {
  return providerResults.map((result) => ({
    providerId: result.providerId,
    providerType: result.providerType,
    providerName: result.providerName,
    status: result.status ?? "succeeded",
    rawCount: result.jobs.length,
    normalizedCount: countProviderJobs(normalizedJobs, result.providerId),
    validCount: countProviderJobs(validJobs, result.providerId),
    returnedCount: countProviderJobs(returnedJobs, result.providerId),
    durationMs: result.durationMs,
  }));
}

function countProviderJobs(jobs: readonly CanonicalJob[], providerId: string): number {
  return jobs.filter((job) => job.providerId === providerId).length;
}
