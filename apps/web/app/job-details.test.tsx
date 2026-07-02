import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { JobDetails, JobDetailsMissing } from "./job-details";
import { createResponse } from "./job-browser-utils.test";

describe("job details", () => {
  it("renders canonical job details with available fields", () => {
    const job = {
      ...createResponse(1).jobs[0]!,
      description: "Build reliable product systems.\nCollaborate with platform teams.",
      department: "Engineering",
      team: "Platform",
      compensation: { summary: "$120k - $150k" },
      metadata: {
        ...createResponse(1).jobs[0]!.metadata,
        sourceBoard: "engineering",
        sourceFields: {
          requirements: "TypeScript",
          benefits: "Health insurance",
        },
      },
    };

    const html = renderToStaticMarkup(
      <JobDetails
        isSelected={false}
        job={job}
        onBack={() => undefined}
        onToggleSelection={() => undefined}
      />,
    );

    expect(html).toContain("Job Details");
    expect(html).toContain("Platform Engineer");
    expect(html).toContain("Gamma");
    expect(html).toContain("Engineering");
    expect(html).toContain("Platform");
    expect(html).toContain("$120k - $150k");
    expect(html).toContain("Build reliable product systems.");
    expect(html).toContain("Requirements");
    expect(html).toContain("TypeScript");
    expect(html).toContain("External Apply URL");
    expect(html).toContain("Select job");
    expect(html).toContain("Back to Browser");
  });

  it("renders selected state and missing optional fields clearly", () => {
    const job = {
      ...createResponse(1).jobs[0]!,
      description: undefined,
      employmentType: undefined,
      postedAt: undefined,
      compensation: undefined,
      metadata: {
        ...createResponse(1).jobs[0]!.metadata,
        sourceFields: {},
      },
    };

    const html = renderToStaticMarkup(
      <JobDetails
        isSelected
        job={job}
        onBack={() => undefined}
        onToggleSelection={() => undefined}
      />,
    );

    expect(html).toContain("Deselect job");
    expect(html).toContain("No description was provided by the source.");
    expect(html).toContain("Not listed");
  });

  it("renders a missing-job fallback", () => {
    const html = renderToStaticMarkup(<JobDetailsMissing onBack={() => undefined} />);

    expect(html).toContain("Job could not be found");
    expect(html).toContain("Back to Browser");
  });
});
