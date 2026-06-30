import { createGreenhouseConnectorConfiguration } from "./configuration";
import { buildGreenhouseJobsUrl } from "./request-builder";

describe("greenhouse request builder", () => {
  it("builds a public Greenhouse job board URL with content enabled", () => {
    const url = buildGreenhouseJobsUrl(
      createGreenhouseConnectorConfiguration({
        boardToken: "acme jobs",
        baseUrl: "https://boards-api.greenhouse.io/v1/",
      }),
    );

    expect(url).toBe("https://boards-api.greenhouse.io/v1/boards/acme%20jobs/jobs?content=true");
  });
});
