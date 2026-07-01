import type { CanonicalJob, JobValidationError, ValidationResult } from "./types";

export function validateCanonicalJobs(jobs: readonly CanonicalJob[]): ValidationResult {
  const validJobs: CanonicalJob[] = [];
  const errors: JobValidationError[] = [];

  for (const job of jobs) {
    const jobErrors = validateCanonicalJob(job);
    if (jobErrors.length === 0) {
      validJobs.push(job);
    } else {
      errors.push(...jobErrors);
    }
  }

  return { validJobs, errors };
}

export function validateCanonicalJob(job: CanonicalJob): JobValidationError[] {
  const errors: JobValidationError[] = [];

  if (job.title.trim() === "") {
    errors.push(createError(job, "missing_title", "Job title is required."));
  }

  if (job.providerId.trim() === "") {
    errors.push(createError(job, "missing_provider", "Provider id is required."));
  }

  if (job.providerJobId.trim() === "") {
    errors.push(createError(job, "missing_identifier", "Provider job identifier is required."));
  }

  if (!isValidUrl(job.sourceUrl)) {
    errors.push(createError(job, "invalid_url", "Job source URL must be absolute and valid."));
  }

  const metadata = job.metadata as unknown;
  if (
    !isRecord(metadata) ||
    job.metadata.providerId !== job.providerId ||
    job.metadata.providerType !== job.providerType ||
    typeof job.metadata.providerName !== "string" ||
    !isRecord(job.metadata.sourceFields)
  ) {
    errors.push(createError(job, "corrupt_metadata", "Provider metadata does not match job."));
  }

  return errors;
}

function createError(job: CanonicalJob, code: string, message: string): JobValidationError {
  return {
    stage: "validation",
    severity: "error",
    code,
    message,
    providerId: job.providerId,
    providerType: job.providerType,
    providerJobId: job.providerJobId,
    sourceUrl: job.sourceUrl,
  };
}

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
