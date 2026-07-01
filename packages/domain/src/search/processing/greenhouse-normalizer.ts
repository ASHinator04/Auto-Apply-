import type { AggregatedRawJob, CanonicalJob } from "./types";
import {
  compact,
  createCanonicalJobId,
  inferWorkMode,
  locationFromLabel,
  readId,
  readProviderMetadata,
  readReferenceName,
  readReferences,
  readString,
} from "./normalization-helpers";
import type { NormalizationOptions } from "./normalization";

export function normalizeGreenhouseJob(
  job: AggregatedRawJob,
  options: NormalizationOptions,
): CanonicalJob {
  const raw = job.rawJob as Record<string, unknown>;
  const providerMetadata = readProviderMetadata(job);
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
