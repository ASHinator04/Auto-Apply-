import { ProviderType, WorkMode } from "@job-agent/contracts";

import type {
  AggregatedRawJob,
  CanonicalJob,
  CanonicalJobCompensation,
  CanonicalJobLocation,
} from "./types";

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

function normalizeGreenhouseJob(
  job: AggregatedRawJob,
  options: NormalizationOptions,
): CanonicalJob {
  const raw = job.rawJob as Record<string, unknown>;
  const providerMetadata = readRecord(raw.providerMetadata);
  const boardToken = readString(providerMetadata?.boardToken);
  const externalId = readId(raw.id) ?? readId(raw.internalJobId) ?? readString(raw.absoluteUrl);
  const locations = compact([
    locationFromLabel(readReferenceName(raw.location)),
    ...readReferences(raw.offices).map((office) => locationFromLabel(office.name)),
  ]);
  const sourceUrl = readString(raw.absoluteUrl) ?? "";
  const title = readString(raw.title) ?? "";

  return {
    id: createCanonicalJobId(job.providerType, externalId, sourceUrl, title),
    providerId: job.providerId,
    providerType: job.providerType,
    providerJobId: externalId ?? "",
    sourceUrl,
    title,
    companyName: job.providerName,
    description: readString(raw.content),
    locations,
    workMode: inferWorkMode(locations),
    department: readReferences(raw.departments)[0]?.name,
    postedAt: readString(raw.updatedAt),
    discoveredAt: options.discoveredAt,
    metadata: {
      providerId: job.providerId,
      providerType: job.providerType,
      providerName: job.providerName,
      sourceBoard: boardToken,
      sourceFields: {
        boardToken,
        internalJobId: readId(raw.internalJobId),
        requisitionId: readString(raw.requisitionId),
      },
    },
  };
}

function normalizeLeverJob(job: AggregatedRawJob, options: NormalizationOptions): CanonicalJob {
  const raw = job.rawJob as Record<string, unknown>;
  const categories = readRecord(raw.categories);
  const providerMetadata = readRecord(raw.providerMetadata);
  const site = readString(providerMetadata?.site);
  const sourceUrl = readString(raw.hostedUrl) ?? readString(raw.applyUrl) ?? "";
  const title = readString(raw.title) ?? "";
  const locations = getLeverLocations(categories);
  const salaryRange = readRecord(raw.salaryRange);

  return {
    id: createCanonicalJobId(job.providerType, readString(raw.id), sourceUrl, title),
    providerId: job.providerId,
    providerType: job.providerType,
    providerJobId: readString(raw.id) ?? "",
    sourceUrl,
    title,
    companyName: job.providerName,
    description:
      readString(raw.descriptionPlain) ??
      readString(raw.descriptionBodyPlain) ??
      readString(raw.openingPlain),
    locations,
    workMode: inferWorkMode(locations, readString(raw.workplaceType)),
    department: readString(categories?.department),
    team: readString(categories?.team),
    employmentType: readString(categories?.commitment),
    compensation: normalizeLeverCompensation(salaryRange, readString(raw.salaryDescriptionPlain)),
    discoveredAt: options.discoveredAt,
    metadata: {
      providerId: job.providerId,
      providerType: job.providerType,
      providerName: job.providerName,
      sourceBoard: site,
      sourceFields: {
        site,
        country: readNullableString(raw.country),
        workplaceType: readString(raw.workplaceType),
      },
    },
  };
}

function normalizeAshbyJob(job: AggregatedRawJob, options: NormalizationOptions): CanonicalJob {
  const raw = job.rawJob as Record<string, unknown>;
  const providerMetadata = readRecord(raw.providerMetadata);
  const jobBoardName = readString(providerMetadata?.jobBoardName);
  const sourceUrl = readString(raw.jobUrl) ?? readString(raw.applyUrl) ?? "";
  const title = readString(raw.title) ?? "";
  const locations = getAshbyLocations(raw);
  const compensation = readRecord(raw.compensation);

  return {
    id: createCanonicalJobId(job.providerType, sourceUrl, sourceUrl, title),
    providerId: job.providerId,
    providerType: job.providerType,
    providerJobId: sourceUrl || title,
    sourceUrl,
    title,
    companyName: job.providerName,
    description: readString(raw.descriptionPlain),
    locations,
    workMode: inferWorkMode(locations, readString(raw.workplaceType), readBoolean(raw.isRemote)),
    department: readString(raw.department),
    team: readString(raw.team),
    employmentType: readString(raw.employmentType),
    compensation: normalizeAshbyCompensation(compensation),
    postedAt: readString(raw.publishedAt),
    discoveredAt: options.discoveredAt,
    metadata: {
      providerId: job.providerId,
      providerType: job.providerType,
      providerName: job.providerName,
      sourceBoard: jobBoardName,
      sourceFields: {
        jobBoardName,
        isListed: readBoolean(raw.isListed),
        isRemote: readBoolean(raw.isRemote),
        workplaceType: readString(raw.workplaceType),
      },
    },
  };
}

function getLeverLocations(
  categories: Record<string, unknown> | undefined,
): CanonicalJobLocation[] {
  const allLocations = readStringArray(categories?.allLocations);
  const values =
    allLocations.length > 0 ? allLocations : compact([readString(categories?.location)]);
  return compact(values.map(locationFromLabel));
}

function getAshbyLocations(raw: Record<string, unknown>): CanonicalJobLocation[] {
  const secondaryLocations = Array.isArray(raw.secondaryLocations) ? raw.secondaryLocations : [];
  return compact([
    locationFromLabel(readString(raw.location)),
    ...secondaryLocations
      .filter(isRecord)
      .map((location) => locationFromLabel(readString(location.location))),
    locationFromPostalAddress(readRecord(readRecord(raw.address)?.postalAddress)),
  ]);
}

function normalizeLeverCompensation(
  salaryRange: Record<string, unknown> | undefined,
  salaryDescription: string | undefined,
): CanonicalJobCompensation | undefined {
  if (salaryRange === undefined && salaryDescription === undefined) {
    return undefined;
  }

  return {
    summary: salaryDescription,
    currency: readString(salaryRange?.currency),
    minAmount: readNumber(salaryRange?.min),
    maxAmount: readNumber(salaryRange?.max),
    interval: readString(salaryRange?.interval),
  };
}

function normalizeAshbyCompensation(
  compensation: Record<string, unknown> | undefined,
): CanonicalJobCompensation | undefined {
  if (compensation === undefined) {
    return undefined;
  }

  const component = readRecordArray(compensation.summaryComponents)[0];

  return {
    summary:
      readString(compensation.compensationTierSummary) ??
      readString(compensation.scrapeableCompensationSalarySummary),
    currency: readNullableString(component?.currencyCode) ?? undefined,
    minAmount: readNullableNumber(component?.minValue) ?? undefined,
    maxAmount: readNullableNumber(component?.maxValue) ?? undefined,
    interval: readString(component?.interval),
  };
}

function locationFromLabel(label: string | undefined): CanonicalJobLocation | undefined {
  if (label === undefined || label.trim() === "") {
    return undefined;
  }

  return {
    label: label.trim(),
    remote: includesRemote(label),
  };
}

function locationFromPostalAddress(
  address: Record<string, unknown> | undefined,
): CanonicalJobLocation | undefined {
  if (address === undefined) {
    return undefined;
  }

  const city = readString(address.addressLocality);
  const region = readString(address.addressRegion);
  const country = readString(address.addressCountry);
  const label = compact([city, region, country]).join(", ");

  if (label === "") {
    return undefined;
  }

  return {
    label,
    city,
    region,
    country,
    remote: includesRemote(label),
  };
}

function inferWorkMode(
  locations: readonly CanonicalJobLocation[],
  workplaceType?: string,
  explicitRemote?: boolean,
): WorkMode {
  if (explicitRemote === true || fold(workplaceType ?? "") === "remote") {
    return WorkMode.Remote;
  }

  if (locations.some((location) => location.remote)) {
    return WorkMode.Remote;
  }

  if (fold(workplaceType ?? "").includes("hybrid")) {
    return WorkMode.Hybrid;
  }

  return WorkMode.Unknown;
}

function createCanonicalJobId(
  providerType: ProviderType,
  externalId: string | undefined,
  sourceUrl: string,
  title: string,
): string {
  const stableId = externalId ?? (sourceUrl || title);
  return `${providerType}:${fold(stableId)}`;
}

function readReferenceName(value: unknown): string | undefined {
  return readString(readRecord(value)?.name);
}

function readReferences(value: unknown): { id?: string; name?: string }[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isRecord).map((reference) => ({
    id: readId(reference.id),
    name: readString(reference.name),
  }));
}

function readRecordArray(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.filter(isRecord) : [];
}

function readRecord(value: unknown): Record<string, unknown> | undefined {
  return isRecord(value) ? value : undefined;
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function readNullableString(value: unknown): string | null | undefined {
  if (value === null) {
    return null;
  }
  return readString(value);
}

function readId(value: unknown): string | undefined {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number") {
    return value.toString();
  }
  return undefined;
}

function readStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function readNumber(value: unknown): number | undefined {
  return typeof value === "number" ? value : undefined;
}

function readNullableNumber(value: unknown): number | null | undefined {
  if (value === null) {
    return null;
  }
  return readNumber(value);
}

function readBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function includesRemote(value: string): boolean {
  return fold(value).includes("remote");
}

function fold(value: string): string {
  return value.trim().toLowerCase();
}

function compact<T>(values: readonly (T | undefined)[]): T[] {
  return values.filter((value): value is T => value !== undefined);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
