import { WorkMode } from "@job-agent/contracts";
import type { JobSearchInput } from "@job-agent/contracts";

import type { AshbySearchRequest, RawAshbyJob } from "./models";

export function createAshbySearchRequest(input: JobSearchInput): AshbySearchRequest {
  return {
    query: input.query,
    locations: input.locations,
    remoteOnly: input.workModes?.includes(WorkMode.Remote),
  };
}

export function filterAshbyJobs(
  jobs: readonly RawAshbyJob[],
  request: AshbySearchRequest = {},
): RawAshbyJob[] {
  return jobs.filter((job) => {
    if (!matchesQuery(job, request.query)) {
      return false;
    }

    if (!matchesAny(request.locations, getLocationValues(job))) {
      return false;
    }

    if (!matchesAny(request.teams, [job.team])) {
      return false;
    }

    if (!matchesAny(request.departments, [job.department])) {
      return false;
    }

    if (!matchesAny(request.employmentTypes, [job.employmentType])) {
      return false;
    }

    if (request.remoteOnly === true && !isRemoteJob(job)) {
      return false;
    }

    return true;
  });
}

function matchesQuery(job: RawAshbyJob, query: string | undefined): boolean {
  if (query === undefined || query.trim() === "") {
    return true;
  }

  const foldedQuery = foldText(query);
  const searchableText = [
    job.title,
    job.location,
    job.department,
    job.team,
    job.workplaceType,
    job.descriptionPlain,
    job.employmentType,
    job.compensation?.compensationTierSummary,
    job.compensation?.scrapeableCompensationSalarySummary,
    ...job.secondaryLocations.map((location) => location.location),
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

function getLocationValues(job: RawAshbyJob): (string | undefined)[] {
  return [
    job.location,
    job.address?.postalAddress?.addressLocality,
    job.address?.postalAddress?.addressRegion,
    job.address?.postalAddress?.addressCountry,
    ...job.secondaryLocations.flatMap((location) => [
      location.location,
      location.address?.addressLocality,
      location.address?.addressRegion,
      location.address?.addressCountry,
    ]),
  ];
}

function isRemoteJob(job: RawAshbyJob): boolean {
  if (job.isRemote === true) {
    return true;
  }

  if (foldText(job.workplaceType ?? "") === "remote") {
    return true;
  }

  return getLocationValues(job).some((value) => foldText(value ?? "").includes("remote"));
}

function foldText(value: string): string {
  return value.trim().toLowerCase();
}
