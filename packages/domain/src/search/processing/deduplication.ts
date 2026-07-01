import { ProviderType } from "@job-agent/contracts";

import type { CanonicalJob, DeduplicationDecision, DeduplicationResult } from "./types";

const DEFAULT_PROVIDER_PRECEDENCE = [
  ProviderType.Greenhouse,
  ProviderType.Lever,
  ProviderType.Ashby,
  ProviderType.Other,
];

export interface DeduplicationOptions {
  providerPrecedence?: readonly ProviderType[];
}

interface DuplicateGroup {
  key: string;
  jobs: CanonicalJob[];
}

export function deduplicateJobs(
  jobs: readonly CanonicalJob[],
  options: DeduplicationOptions = {},
): DeduplicationResult {
  const groups = groupDuplicates(jobs);
  const providerPrecedence = options.providerPrecedence ?? DEFAULT_PROVIDER_PRECEDENCE;
  const kept: CanonicalJob[] = [];
  const removed: DeduplicationDecision[] = [];

  for (const group of groups) {
    const winner = chooseBestJob(group.jobs, providerPrecedence);
    kept.push(winner);

    for (const duplicate of group.jobs) {
      if (duplicate.id !== winner.id) {
        removed.push({
          duplicateJobId: duplicate.id,
          keptJobId: winner.id,
          reason: group.key,
        });
      }
    }
  }

  return {
    jobs: kept,
    removed,
  };
}

function groupDuplicates(jobs: readonly CanonicalJob[]): DuplicateGroup[] {
  const groups: DuplicateGroup[] = [];
  const groupByKey = new Map<string, DuplicateGroup>();

  for (const job of jobs) {
    const keys = getDuplicateKeys(job);
    const existingGroup = keys
      .map((key) => groupByKey.get(key))
      .find((group) => group !== undefined);

    if (existingGroup === undefined) {
      const group = { key: keys[0] ?? job.id, jobs: [job] };
      groups.push(group);
      for (const key of keys) {
        groupByKey.set(key, group);
      }
    } else {
      existingGroup.jobs.push(job);
      for (const key of keys) {
        groupByKey.set(key, existingGroup);
      }
    }
  }

  return groups;
}

function getDuplicateKeys(job: CanonicalJob): string[] {
  return [
    `provider:${job.providerType}:${fold(job.providerJobId)}`,
    `url:${canonicalizeUrl(job.sourceUrl)}`,
    `identity:${fold(job.companyName)}:${fold(job.title)}:${fold(getPrimaryLocation(job))}`,
  ];
}

function chooseBestJob(
  jobs: readonly CanonicalJob[],
  providerPrecedence: readonly ProviderType[],
): CanonicalJob {
  return [...jobs].sort((left, right) => {
    const providerComparison =
      providerRank(left.providerType, providerPrecedence) -
      providerRank(right.providerType, providerPrecedence);
    if (providerComparison !== 0) {
      return providerComparison;
    }

    const completenessComparison = getCompletenessScore(right) - getCompletenessScore(left);
    if (completenessComparison !== 0) {
      return completenessComparison;
    }

    return left.id.localeCompare(right.id);
  })[0] as CanonicalJob;
}

function providerRank(
  providerType: ProviderType,
  providerPrecedence: readonly ProviderType[],
): number {
  const index = providerPrecedence.indexOf(providerType);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

function getCompletenessScore(job: CanonicalJob): number {
  return [
    job.description,
    job.department,
    job.team,
    job.employmentType,
    job.compensation?.summary,
    job.postedAt,
  ].filter((value) => value !== undefined && value !== "").length;
}

function getPrimaryLocation(job: CanonicalJob): string {
  return job.locations[0]?.label ?? "";
}

function canonicalizeUrl(value: string): string {
  try {
    const url = new URL(value);
    url.hash = "";
    url.searchParams.sort();
    return url.toString().replace(/\/$/, "").toLowerCase();
  } catch {
    return fold(value);
  }
}

function fold(value: string): string {
  return value.trim().toLowerCase();
}
