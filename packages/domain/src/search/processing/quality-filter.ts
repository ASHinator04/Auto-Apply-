import type { CanonicalJob, JobValidationError, QualityFilteringResult } from "./types";

export function filterLowQualityJobs(jobs: readonly CanonicalJob[]): QualityFilteringResult {
  const kept: CanonicalJob[] = [];
  const errors: JobValidationError[] = [];

  for (const job of jobs) {
    const jobErrors = getQualityErrors(job);
    if (jobErrors.length === 0) {
      kept.push(job);
    } else {
      errors.push(...jobErrors);
    }
  }

  return { jobs: kept, errors };
}

function getQualityErrors(job: CanonicalJob): JobValidationError[] {
  const errors: JobValidationError[] = [];

  if (job.companyName.trim() === "") {
    errors.push(createError(job, "missing_company", "Job company name is required."));
  }

  if (job.locations.length === 0) {
    errors.push(createError(job, "missing_location", "At least one job location is required."));
  }

  if (job.metadata.sourceFields === undefined) {
    errors.push(
      createError(job, "missing_source_metadata", "Provider source metadata is required."),
    );
  }

  return errors;
}

function createError(job: CanonicalJob, code: string, message: string): JobValidationError {
  return {
    stage: "quality_filtering",
    severity: "error",
    code,
    message,
    providerId: job.providerId,
    providerType: job.providerType,
    providerJobId: job.providerJobId,
    sourceUrl: job.sourceUrl,
  };
}
