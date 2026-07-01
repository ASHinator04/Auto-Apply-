import { ProviderType, WorkMode, type JobSearchInput } from "@job-agent/contracts";
import type { UnifiedSearchResponse } from "@job-agent/domain";
import { renderToStaticMarkup } from "react-dom/server";
import React from "react";
import { describe, expect, it } from "vitest";

import { SearchEmptyState } from "./search-empty-state";
import { SearchErrorState } from "./search-error-state";
import { SearchForm } from "./search-form";
import { SearchResponseSummary } from "./search-response-summary";
import { emptySearchFormState } from "./search-utils";

describe("search experience states", () => {
  it("renders an accessible empty state", () => {
    const html = renderToStaticMarkup(<SearchEmptyState />);

    expect(html).toContain("Start with keywords");
    expect(html).toContain("Job Browser");
  });

  it("renders search form labels and resume selector", () => {
    const html = renderToStaticMarkup(
      <SearchForm
        form={{ ...emptySearchFormState("resume-1"), keywords: "software" }}
        isBusy={false}
        onChange={() => undefined}
        onSubmit={() => undefined}
        resumes={[
          {
            id: "resume-1",
            displayName: "Backend Resume",
            originalFilename: "backend.pdf",
            uploadDate: "2026-01-01T00:00:00.000Z",
            size: 1024,
            mimeType: "application/pdf",
            version: 1,
            isPrimary: true,
          },
        ]}
      />,
    );

    expect(html).toContain("Keywords");
    expect(html).toContain("Backend Resume");
    expect(html).toContain("Remote only");
    expect(html).toContain("required");
    expect(html).toContain('minLength="2"');
  });

  it("renders loading state", () => {
    const html = renderToStaticMarkup(<SearchResponseSummary response={null} status="loading" />);

    expect(html).toContain("Search is running");
  });

  it("renders error state with retry control", () => {
    const html = renderToStaticMarkup(
      <SearchErrorState message="Search failed." onRetry={() => undefined} />,
    );

    expect(html).toContain("Search failed.");
    expect(html).toContain("Retry");
    expect(html).toContain('tabindex="-1"');
  });

  it("renders no-results state for an empty unified response", () => {
    const html = renderToStaticMarkup(
      <SearchResponseSummary response={createResponse(0)} status="success" />,
    );

    expect(html).toContain("No results returned");
  });

  it("renders response metrics with browser handoff copy", () => {
    const html = renderToStaticMarkup(
      <SearchResponseSummary response={createResponse(2)} status="success" />,
    );

    expect(html).toContain("Jobs returned");
    expect(html).toContain("Job Browser");
  });
});

function createResponse(jobCount: number): UnifiedSearchResponse {
  const request: JobSearchInput = {
    userId: "local-user",
    query: "software",
    workModes: [WorkMode.Remote],
  };

  return {
    request,
    jobs: Array.from({ length: jobCount }, (_, index) => ({
      id: `job-${index.toString()}`,
      providerId: "provider-1",
      providerType: ProviderType.Other,
      providerJobId: `posting-${index.toString()}`,
      sourceUrl: `https://jobs.example.com/${index.toString()}`,
      title: "Software Engineer",
      companyName: "Example",
      locations: [{ label: "Remote", remote: true }],
      workMode: WorkMode.Remote,
      discoveredAt: "2026-01-01T00:00:00.000Z",
      metadata: {
        providerId: "provider-1",
        providerType: ProviderType.Other,
        providerName: "Example",
        sourceFields: {},
      },
    })),
    rankedJobs: [],
    providerStatistics: [],
    processing: {
      rawCount: jobCount,
      aggregatedCount: jobCount,
      normalizedCount: jobCount,
      validCount: jobCount,
      deduplicatedCount: jobCount,
      qualityFilteredCount: jobCount,
      returnedCount: jobCount,
      validationErrorCount: 0,
      duplicateCount: 0,
      stageTimings: [],
    },
    validation: { errors: [] },
    deduplication: { removed: [] },
    createdAt: "2026-01-01T00:00:00.000Z",
  };
}
