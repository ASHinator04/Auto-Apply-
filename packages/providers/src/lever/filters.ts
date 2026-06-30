import { WorkMode } from "@job-agent/contracts";
import type { JobSearchInput } from "@job-agent/contracts";

import type { LeverSearchRequest, RawLeverJob } from "./models";

export function createLeverSearchRequest(input: JobSearchInput): LeverSearchRequest {
  return {
    query: input.query,
    locations: input.locations,
    remoteOnly: input.workModes?.includes(WorkMode.Remote),
  };
}

export function filterLeverJobs(
  jobs: readonly RawLeverJob[],
  request: LeverSearchRequest = {},
): RawLeverJob[] {
  return jobs.filter((job) => {
    if (!matchesQuery(job, request.query)) {
      return false;
    }

    if (!matchesAny(request.locations, getLocationValues(job))) {
      return false;
    }

    if (!matchesAny(request.teams, [job.categories.team])) {
      return false;
    }

    if (!matchesAny(request.departments, [job.categories.department])) {
      return false;
    }

    if (!matchesAny(request.commitments, [job.categories.commitment])) {
      return false;
    }

    if (request.remoteOnly === true && !isRemoteJob(job)) {
      return false;
    }

    return true;
  });
}

function matchesQuery(job: RawLeverJob, query: string | undefined): boolean {
  if (query === undefined || query.trim() === "") {
    return true;
  }

  const foldedQuery = foldText(query);
  const searchableText = [
    job.title,
    job.openingPlain,
    job.descriptionPlain,
    job.descriptionBodyPlain,
    job.additionalPlain,
    job.categories.location,
    job.categories.commitment,
    job.categories.team,
    job.categories.department,
    job.workplaceType,
    ...job.categories.allLocations,
    ...job.lists.flatMap((list) => [list.text, list.content]),
  ]
    .filter((value): value is string => value !== undefined)
    .map(foldText)
    .join(" ");

  return searchableText.includes(foldedQuery);
}

function matchesAny(
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

function getLocationValues(job: RawLeverJob): (string | undefined)[] {
  return [job.categories.location, ...job.categories.allLocations];
}

function isRemoteJob(job: RawLeverJob): boolean {
  if (foldText(job.workplaceType ?? "") === "remote") {
    return true;
  }

  return getLocationValues(job).some((value) => foldText(value ?? "").includes("remote"));
}

function foldText(value: string): string {
  return value.trim().toLowerCase();
}
