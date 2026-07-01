import type { NormalizationOptions } from "./normalization";
import {
  compact,
  createCanonicalJobId,
  inferWorkMode,
  locationFromLabel,
  normalizeOptionalCompensation,
  readNullableString,
  readNumber,
  readProviderMetadata,
  readRecord,
  readString,
  readStringArray,
} from "./normalization-helpers";
import type { AggregatedRawJob, CanonicalJob, CanonicalJobLocation } from "./types";

export function normalizeLeverJob(
  job: AggregatedRawJob,
  options: NormalizationOptions,
): CanonicalJob {
  const raw = job.rawJob as Record<string, unknown>;
  const categories = readRecord(raw.categories);
  const providerMetadata = readProviderMetadata(job);
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
    compensation: normalizeOptionalCompensation(
      readString(raw.salaryDescriptionPlain),
      readString(salaryRange?.currency),
      readNumber(salaryRange?.min),
      readNumber(salaryRange?.max),
      readString(salaryRange?.interval),
    ),
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

function getLeverLocations(
  categories: Record<string, unknown> | undefined,
): CanonicalJobLocation[] {
  const allLocations = readStringArray(categories?.allLocations);
  const values =
    allLocations.length > 0 ? allLocations : compact([readString(categories?.location)]);
  return compact(values.map(locationFromLabel));
}
