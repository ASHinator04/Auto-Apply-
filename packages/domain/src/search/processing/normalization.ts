import { ProviderType } from "@job-agent/contracts";

import { normalizeAshbyJob } from "./ashby-normalizer";
import { normalizeGreenhouseJob } from "./greenhouse-normalizer";
import { normalizeLeverJob } from "./lever-normalizer";
import { isRecord } from "./normalization-helpers";
import type { AggregatedRawJob, CanonicalJob } from "./types";

export interface NormalizationOptions {
  discoveredAt: string;
}

export function normalizeAggregatedJobs(
  jobs: readonly AggregatedRawJob[],
  options: NormalizationOptions,
): CanonicalJob[] {
  return jobs.flatMap((job) => {
    const normalized = normalizeAggregatedJob(job, options);
    return normalized === undefined ? [] : [normalized];
  });
}

export function normalizeAggregatedJob(
  job: AggregatedRawJob,
  options: NormalizationOptions,
): CanonicalJob | undefined {
  if (!isRecord(job.rawJob)) {
    return undefined;
  }

  if (job.providerType === ProviderType.Greenhouse) {
    return normalizeGreenhouseJob(job, options);
  }

  if (job.providerType === ProviderType.Lever) {
    return normalizeLeverJob(job, options);
  }

  if (job.providerType === ProviderType.Ashby) {
    return normalizeAshbyJob(job, options);
  }

  return undefined;
}
