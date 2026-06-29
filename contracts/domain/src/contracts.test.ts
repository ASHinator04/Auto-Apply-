import { describe, expect, it } from "vitest";

import {
  ApplicationStatus,
  EmploymentType,
  JobType,
  KnowledgeEntryType,
  KnowledgeSection,
  ProviderType,
  ResumeType,
  WorkMode,
  type Job,
  type SearchResult,
  type ValidationError,
} from "./index";

describe("domain contracts", () => {
  it("uses stable string enum values for serialization", () => {
    expect(ApplicationStatus.Found).toBe("found");
    expect(ProviderType.Greenhouse).toBe("greenhouse");
    expect(KnowledgeEntryType.LongForm).toBe("long_form");
    expect(KnowledgeSection.BehavioralAnswers).toBe("behavioral_answers");
  });

  it("serializes and deserializes normalized search results", () => {
    const job: Job = {
      id: "job_1",
      providerId: "provider_1",
      providerType: ProviderType.Greenhouse,
      externalId: "external_1",
      sourceUrl: "https://example.com/jobs/1",
      title: "Software Engineer",
      companyName: "Example Co",
      location: { city: "Remote", remote: true },
      jobType: JobType.FullTime,
      employmentType: EmploymentType.Permanent,
      workMode: WorkMode.Remote,
      discoveredAt: "2026-06-28T00:00:00.000Z",
    };
    const result: SearchResult = {
      id: "result_1",
      requestId: "request_1",
      jobs: [job],
      totalFound: 1,
      providerTypes: [ProviderType.Greenhouse],
      createdAt: "2026-06-28T00:00:00.000Z",
    };

    const parsed = JSON.parse(JSON.stringify(result)) as SearchResult;

    expect(parsed.jobs[0]?.providerType).toBe(ProviderType.Greenhouse);
    expect(parsed.jobs[0]?.workMode).toBe(WorkMode.Remote);
  });

  it("keeps errors framework independent", () => {
    const error: ValidationError = {
      kind: "validation",
      code: "required",
      message: "A required field is missing.",
      field: "title",
    };

    expect(error.kind).toBe("validation");
    expect(error).not.toHaveProperty("statusCode");
  });

  it("defines resume metadata without parsed resume content", () => {
    const resume = {
      id: "resume_1",
      userId: "user_1",
      type: ResumeType.Primary,
      label: "Primary Resume",
      fileName: "resume.pdf",
      mimeType: "application/pdf",
      sizeBytes: 1024,
      version: 1,
      isPrimary: true,
      createdAt: "2026-06-28T00:00:00.000Z",
      updatedAt: "2026-06-28T00:00:00.000Z",
    };

    expect(resume).not.toHaveProperty("parsedText");
    expect(resume.isPrimary).toBe(true);
  });

  it("defines knowledge entries as editable profile records", () => {
    const entry = {
      id: "knowledge_1",
      userId: "user_1",
      section: KnowledgeSection.CompanySpecificAnswers,
      type: KnowledgeEntryType.LongForm,
      key: "Why Example Co",
      value: "I am interested in the platform team because...",
      companyName: "Example Co",
      tags: [],
      embeddingReady: false,
      sortOrder: 0,
      createdAt: "2026-06-29T00:00:00.000Z",
      updatedAt: "2026-06-29T00:00:00.000Z",
    };

    expect(entry.section).toBe(KnowledgeSection.CompanySpecificAnswers);
    expect(entry.embeddingReady).toBe(false);
  });
});
