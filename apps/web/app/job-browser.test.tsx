import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { JobBrowser } from "./job-browser";
import { createResponse } from "./job-browser-utils.test";
import { createSearchSession, selectJobsInSession } from "./search-session";

describe("job browser", () => {
  it("renders browser controls and job cards from a unified response", () => {
    const html = renderToStaticMarkup(
      <JobBrowser
        onSessionChange={() => undefined}
        session={createSearchSession({
          id: "session-1",
          request: { keywords: "engineer", remoteOnly: false },
          response: createResponse(3),
        })}
      />,
    );

    expect(html).toContain("Job Browser");
    expect(html).toContain("Session session-1");
    expect(html).toContain("Provider");
    expect(html).toContain("Remote");
    expect(html).toContain("Employment Type");
    expect(html).toContain("Location");
    expect(html).toContain("Sort");
    expect(html).toContain("Platform Engineer");
    expect(html).toContain("Greenhouse");
    expect(html).toContain("Select visible");
    expect(html).toContain("Clear selection");
    expect(html).toContain("View details");
  });

  it("renders pagination controls for larger responses", () => {
    const html = renderToStaticMarkup(
      <JobBrowser
        onSessionChange={() => undefined}
        session={createSearchSession({
          id: "session-1",
          request: { keywords: "engineer", remoteOnly: false },
          response: createResponse(12),
        })}
      />,
    );

    expect(html).toContain("Page 1 of 2");
    expect(html).toContain("Previous");
    expect(html).toContain("Next");
  });

  it("renders selection from the active search session", () => {
    const session = selectJobsInSession(
      createSearchSession({
        id: "session-1",
        request: { keywords: "engineer", remoteOnly: false },
        response: createResponse(3),
      }),
      ["job-1", "job-2"],
    );

    const html = renderToStaticMarkup(
      <JobBrowser onSessionChange={() => undefined} session={session} />,
    );

    expect(html).toContain("2 selected");
    expect(html).toContain("Deselect Platform Engineer at Gamma");
  });
});
