import { LeverConnectorError } from "./errors";
import type { LeverJobCategories, LeverJobList, RawLeverJob } from "./models";

export function parseLeverPostingsResponse(payload: unknown, site: string): RawLeverJob[] {
  if (!Array.isArray(payload)) {
    throw new LeverConnectorError("Lever response must be a postings array.", "invalid_response");
  }

  return payload.map((posting) => parseLeverJob(posting, site));
}

function parseLeverJob(payload: unknown, site: string): RawLeverJob {
  if (!isRecord(payload)) {
    throw new LeverConnectorError("Lever posting must be an object.", "invalid_response");
  }

  return {
    id: readString(payload.id),
    title: readString(payload.text),
    categories: parseCategories(payload.categories),
    country: readNullableString(payload.country),
    workplaceType: readString(payload.workplaceType),
    hostedUrl: readString(payload.hostedUrl),
    applyUrl: readString(payload.applyUrl),
    opening: readString(payload.opening),
    openingPlain: readString(payload.openingPlain),
    description: readString(payload.description),
    descriptionPlain: readString(payload.descriptionPlain),
    descriptionBody: readString(payload.descriptionBody),
    descriptionBodyPlain: readString(payload.descriptionBodyPlain),
    lists: parseLists(payload.lists),
    additional: readString(payload.additional),
    additionalPlain: readString(payload.additionalPlain),
    salaryRange: parseSalaryRange(payload.salaryRange),
    salaryDescription: readString(payload.salaryDescription),
    salaryDescriptionPlain: readString(payload.salaryDescriptionPlain),
    providerMetadata: {
      provider: "lever",
      site,
    },
    raw: { ...payload },
  };
}

function parseCategories(value: unknown): LeverJobCategories {
  if (!isRecord(value)) {
    return { allLocations: [] };
  }

  return {
    location: readString(value.location),
    commitment: readString(value.commitment),
    team: readString(value.team),
    department: readString(value.department),
    allLocations: readStringArray(value.allLocations),
  };
}

function parseLists(value: unknown): LeverJobList[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isRecord).map((list) => ({
    text: readString(list.text),
    content: readString(list.content),
  }));
}

function parseSalaryRange(value: unknown): RawLeverJob["salaryRange"] {
  if (!isRecord(value)) {
    return undefined;
  }

  return {
    currency: readString(value.currency),
    interval: readString(value.interval),
    min: readNumber(value.min),
    max: readNumber(value.max),
  };
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

function readNumber(value: unknown): number | undefined {
  return typeof value === "number" ? value : undefined;
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
