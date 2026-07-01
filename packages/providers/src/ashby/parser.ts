import { AshbyConnectorError } from "./errors";
import type {
  AshbyCompensation,
  AshbyCompensationComponent,
  AshbyCompensationTier,
  AshbyJobAddress,
  AshbyPostalAddress,
  AshbySecondaryLocation,
  RawAshbyJob,
} from "./models";

export function parseAshbyPostingsResponse(payload: unknown, jobBoardName: string): RawAshbyJob[] {
  if (!isRecord(payload) || !Array.isArray(payload.jobs)) {
    throw new AshbyConnectorError("Ashby response must contain a jobs array.", "invalid_response");
  }

  return payload.jobs.map((job) => parseAshbyJob(job, jobBoardName));
}

function parseAshbyJob(payload: unknown, jobBoardName: string): RawAshbyJob {
  if (!isRecord(payload)) {
    throw new AshbyConnectorError("Ashby job must be an object.", "invalid_response");
  }

  return {
    title: readString(payload.title),
    location: readString(payload.location),
    secondaryLocations: parseSecondaryLocations(payload.secondaryLocations),
    department: readString(payload.department),
    team: readString(payload.team),
    isListed: readBoolean(payload.isListed),
    isRemote: readBoolean(payload.isRemote),
    workplaceType: readString(payload.workplaceType),
    descriptionHtml: readString(payload.descriptionHtml),
    descriptionPlain: readString(payload.descriptionPlain),
    publishedAt: readString(payload.publishedAt),
    employmentType: readString(payload.employmentType),
    address: parseAddress(payload.address),
    jobUrl: readString(payload.jobUrl),
    applyUrl: readString(payload.applyUrl),
    compensation: parseCompensation(payload.compensation),
    providerMetadata: {
      provider: "ashby",
      jobBoardName,
    },
    raw: { ...payload },
  };
}

function parseSecondaryLocations(value: unknown): AshbySecondaryLocation[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isRecord).map((location) => ({
    location: readString(location.location),
    address: parsePostalAddress(location.address),
  }));
}

function parseAddress(value: unknown): AshbyJobAddress | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  return {
    postalAddress: parsePostalAddress(value.postalAddress),
  };
}

function parsePostalAddress(value: unknown): AshbyPostalAddress | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  return {
    addressLocality: readString(value.addressLocality),
    addressRegion: readString(value.addressRegion),
    addressCountry: readString(value.addressCountry),
  };
}

function parseCompensation(value: unknown): AshbyCompensation | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  return {
    compensationTierSummary: readString(value.compensationTierSummary),
    scrapeableCompensationSalarySummary: readString(value.scrapeableCompensationSalarySummary),
    compensationTiers: parseCompensationTiers(value.compensationTiers),
    summaryComponents: parseCompensationComponents(value.summaryComponents),
  };
}

function parseCompensationTiers(value: unknown): AshbyCompensationTier[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isRecord).map((tier) => ({
    id: readString(tier.id),
    tierSummary: readString(tier.tierSummary),
    title: readString(tier.title),
    additionalInformation: readNullableString(tier.additionalInformation),
    components: parseCompensationComponents(tier.components),
  }));
}

function parseCompensationComponents(value: unknown): AshbyCompensationComponent[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isRecord).map((component) => ({
    id: readString(component.id),
    summary: readString(component.summary),
    compensationType: readString(component.compensationType),
    interval: readString(component.interval),
    currencyCode: readNullableString(component.currencyCode),
    minValue: readNullableNumber(component.minValue),
    maxValue: readNullableNumber(component.maxValue),
  }));
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

function readBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function readNullableNumber(value: unknown): number | null | undefined {
  if (value === null) {
    return null;
  }

  return typeof value === "number" ? value : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
