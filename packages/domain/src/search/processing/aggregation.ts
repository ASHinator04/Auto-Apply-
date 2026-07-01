import type { AggregatedRawJob, RawProviderResultCollection } from "./types";

const DEFAULT_PROVIDER_PRIORITY = 1_000;

export function aggregateProviderResults(
  collections: readonly RawProviderResultCollection[],
): AggregatedRawJob[] {
  return collections.flatMap((collection, collectionIndex) =>
    collection.jobs.map((rawJob, jobIndex) => ({
      providerId: collection.providerId,
      providerType: collection.providerType,
      providerName: collection.providerName,
      providerPriority: collection.providerPriority ?? DEFAULT_PROVIDER_PRIORITY,
      collectionIndex,
      jobIndex,
      rawJob,
    })),
  );
}
