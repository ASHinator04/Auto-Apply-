import { createAshbyConnectorConfiguration } from "./configuration";
import { buildAshbyJobsUrl } from "./request-builder";

describe("ashby request builder", () => {
  it("builds Ashby public posting URLs with compensation configuration", () => {
    const url = new URL(
      buildAshbyJobsUrl(
        createAshbyConnectorConfiguration({
          jobBoardName: "Acme Jobs",
          includeCompensation: false,
        }),
      ),
    );

    expect(url.origin).toBe("https://api.ashbyhq.com");
    expect(url.pathname).toBe("/posting-api/job-board/Acme%20Jobs");
    expect(url.searchParams.get("includeCompensation")).toBe("false");
  });
});
