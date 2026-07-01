import { type ProviderType, WorkMode } from "@job-agent/contracts";

import type { CanonicalJobCompensation, CanonicalJobLocation, AggregatedRawJob } from "./types";

export function createCanonicalJobId(
  providerType: ProviderType,
  externalId: string | undefined,
  sourceUrl: string,
  title: string,
): string {
  const stableId = externalId ?? (sourceUrl || title);
  return `${providerType}:${fold(stableId)}`;
}

export function locationFromLabel(label: string | undefined): CanonicalJobLocation | undefined {
  if (label === undefined || label.trim() === "") {
    return undefined;
  }

  return {
    label: label.trim(),
    remote: includesRemote(label),
  };
}

export function locationFromPostalAddress(
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

export function inferWorkMode(
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

export function normalizeOptionalCompensation(
  summary: string | undefined,
  currency: string | null | undefined,
  minAmount: number | null | undefined,
  maxAmount: number | null | undefined,
  interval: string | undefined,
): CanonicalJobCompensation | undefined {
  if (
    summary === undefined &&
    currency === undefined &&
    minAmount === undefined &&
    maxAmount === undefined &&
    interval === undefined
  ) {
    return undefined;
  }

  return {
    summary,
    currency: currency ?? undefined,
    minAmount: minAmount ?? undefined,
    maxAmount: maxAmount ?? undefined,
    interval,
  };
}

export function readProviderMetadata(job: AggregatedRawJob): Record<string, unknown> | undefined {
  return readRecord((job.rawJob as Record<string, unknown>).providerMetadata);
}

export function readReferenceName(value: unknown): string | undefined {
  return readString(readRecord(value)?.name);
}

export function readReferences(value: unknown): { id?: string; name?: string }[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isRecord).map((reference) => ({
    id: readId(reference.id),
    name: readString(reference.name),
  }));
}

export function readRecordArray(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.filter(isRecord) : [];
}

export function readRecord(value: unknown): Record<string, unknown> | undefined {
  return isRecord(value) ? value : undefined;
}

export function readString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export function readNullableString(value: unknown): string | null | undefined {
  if (value === null) {
    return null;
  }
  return readString(value);
}

export function readId(value: unknown): string | undefined {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number") {
    return value.toString();
  }
  return undefined;
}

export function readStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

export function readNumber(value: unknown): number | undefined {
  return typeof value === "number" ? value : undefined;
}

export function readNullableNumber(value: unknown): number | null | undefined {
  if (value === null) {
    return null;
  }
  return readNumber(value);
}

export function readBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

export function compact<T>(values: readonly (T | undefined)[]): T[] {
  return values.filter((value): value is T => value !== undefined);
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function includesRemote(value: string): boolean {
  return fold(value).includes("remote");
}

function fold(value: string): string {
  return value.trim().toLowerCase();
}
