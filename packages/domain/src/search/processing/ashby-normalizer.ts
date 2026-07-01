import type { NormalizationOptions } from "./normalization";
import {
  compact,
  createCanonicalJobId,
  inferWorkMode,
  isRecord,
  locationFromLabel,
  locationFromPostalAddress,
  normalizeOptionalCompensation,
  readBoolean,
  readNullableNumber,
  readNullableString,
  readProviderMetadata,
  readRecord,
  readRecordArray,
  readString,
} from "./normalization-helpers";
import type { AggregatedRawJob, CanonicalJob, CanonicalJobLocation } from "./types";

export function normalizeAshbyJob(
  job: AggregatedRawJob,
  options: NormalizationOptions,
): CanonicalJob {
  const raw = job.rawJob as Record<string, unknown>;
  const providerMetadata = readProviderMetadata(job);
  const jobBoardName = readString(providerMetadata?.jobBoardName);
  const sourceUrl = readString(raw.jobUrl) ?? readString(raw.applyUrl) ?? "";
  const title = readString(raw.title) ?? "";
  const locations = getAshbyLocations(raw);
  const compensation = readRecord(raw.compensation);
  const compensationComponent = readRecordArray(compensation?.summaryComponents)[0];

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
    compensation: normalizeOptionalCompensation(
      readString(compensation?.compensationTierSummary) ??
        readString(compensation?.scrapeableCompensationSalarySummary),
      readNullableString(compensationComponent?.currencyCode),
      readNullableNumber(compensationComponent?.minValue),
      readNullableNumber(compensationComponent?.maxValue),
      readString(compensationComponent?.interval),
    ),
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
