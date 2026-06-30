import { WorkMode } from "@job-agent/contracts";
import type { JobSearchInput } from "@job-agent/contracts";

import type { GreenhouseSearchRequest, RawGreenhouseJob } from "./models";

export function createGreenhouseSearchRequest(input: JobSearchInput): GreenhouseSearchRequest {
  return {
    query: input.query,
    locations: input.locations,
    remoteOnly: input.workModes?.includes(WorkMode.Remote),
  };
}

export function filterGreenhouseJobs(
  jobs: readonly RawGreenhouseJob[],
  request: GreenhouseSearchRequest = {},
): RawGreenhouseJob[] {
  return jobs.filter((job) => {
    if (!matchesQuery(job, request.query)) {
      return false;
    }

    if (!matchesAny(job, request.locations, getLocationValues(job))) {
      return false;
    }

    if (
      !matchesAny(
        job,
        request.departments,
        job.departments.map((department) => department.name),
      )
    ) {
      return false;
    }

    if (request.remoteOnly === true && !isRemoteJob(job)) {
      return false;
    }

    return true;
  });
}

function matchesQuery(job: RawGreenhouseJob, query: string | undefined): boolean {
  if (query === undefined || query.trim() === "") {
    return true;
  }

  const foldedQuery = foldText(query);
  const searchableText = [
    job.title,
    job.content,
    job.location?.name,
    ...job.departments.map((department) => department.name),
    ...job.offices.map((office) => office.name),
  ]
    .filter((value): value is string => value !== undefined)
    .map(foldText)
    .join(" ");

  return searchableText.includes(foldedQuery);
}

function matchesAny(
  job: RawGreenhouseJob,
  requestedValues: readonly string[] | undefined,
  availableValues: readonly (string | undefined)[],
): boolean {
  if (requestedValues === undefined || requestedValues.length === 0) {
    return true;
  }

  const foldedAvailableValues = availableValues
    .filter((value): value is string => value !== undefined)
    .map(foldText);

  if (foldedAvailableValues.length === 0) {
    return false;
  }

  return requestedValues
    .map(foldText)
    .some((requestedValue) =>
      foldedAvailableValues.some((availableValue) => availableValue.includes(requestedValue)),
    );
}

function getLocationValues(job: RawGreenhouseJob): (string | undefined)[] {
  return [job.location?.name, ...job.offices.map((office) => office.name)];
}

function isRemoteJob(job: RawGreenhouseJob): boolean {
  return getLocationValues(job).some((value) => foldText(value ?? "").includes("remote"));
}

function foldText(value: string): string {
  return value.trim().toLowerCase();
}
