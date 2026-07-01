import type { JobSearchInput } from "@job-agent/contracts";

import type { CanonicalJob, RankedJob } from "./types";

export interface RankingOptions {
  providerPriorities?: ReadonlyMap<string, number>;
  now?: string;
}

export function rankJobs(
  jobs: readonly CanonicalJob[],
  request: JobSearchInput,
  options: RankingOptions = {},
): RankedJob[] {
  return jobs
    .map((job) => rankJob(job, request, options))
    .sort((left, right) => compareRankedJobs(left, right));
}

export function rankJob(
  job: CanonicalJob,
  request: JobSearchInput,
  options: RankingOptions = {},
): RankedJob {
  const signals = {
    keyword: getKeywordScore(job, request.query),
    recency: getRecencyScore(job.postedAt, options.now),
    providerPriority: getProviderPriorityScore(job, options.providerPriorities),
  };
  const score = signals.keyword + signals.recency + signals.providerPriority;

  return { job, score, signals };
}

function compareRankedJobs(left: RankedJob, right: RankedJob): number {
  if (right.score !== left.score) {
    return right.score - left.score;
  }

  const postedComparison = (right.job.postedAt ?? "").localeCompare(left.job.postedAt ?? "");
  if (postedComparison !== 0) {
    return postedComparison;
  }

  return `${left.job.companyName}:${left.job.title}:${left.job.sourceUrl}`.localeCompare(
    `${right.job.companyName}:${right.job.title}:${right.job.sourceUrl}`,
  );
}

function getKeywordScore(job: CanonicalJob, query: string): number {
  const tokens = query
    .split(/\s+/)
    .map((token) => fold(token))
    .filter((token) => token !== "");

  if (tokens.length === 0) {
    return 0;
  }

  return tokens.reduce((score, token) => score + getTokenScore(job, token), 0);
}

function getTokenScore(job: CanonicalJob, token: string): number {
  let score = 0;

  if (fold(job.title).includes(token)) {
    score += 10;
  }
  if (fold(job.companyName).includes(token)) {
    score += 3;
  }
  if (fold(job.description ?? "").includes(token)) {
    score += 2;
  }
  if (job.locations.some((location) => fold(location.label ?? "").includes(token))) {
    score += 1;
  }

  return score;
}

function getRecencyScore(postedAt: string | undefined, now: string | undefined): number {
  if (postedAt === undefined || now === undefined) {
    return 0;
  }

  const postedTime = Date.parse(postedAt);
  const nowTime = Date.parse(now);

  if (Number.isNaN(postedTime) || Number.isNaN(nowTime) || postedTime > nowTime) {
    return 0;
  }

  const ageDays = Math.floor((nowTime - postedTime) / 86_400_000);

  if (ageDays <= 7) {
    return 5;
  }
  if (ageDays <= 30) {
    return 3;
  }
  if (ageDays <= 90) {
    return 1;
  }
  return 0;
}

function getProviderPriorityScore(
  job: CanonicalJob,
  providerPriorities: ReadonlyMap<string, number> | undefined,
): number {
  const priority = providerPriorities?.get(job.providerId);
  if (priority === undefined) {
    return 0;
  }
  return Math.max(0, 5 - Math.floor(priority / 100));
}

function fold(value: string): string {
  return value.trim().toLowerCase();
}
