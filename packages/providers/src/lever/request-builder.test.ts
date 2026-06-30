import { createLeverConnectorConfiguration } from "./configuration";
import { buildLeverJobsUrl } from "./request-builder";

describe("lever request builder", () => {
  it("builds Lever postings URLs with pagination and supported filters", () => {
    const url = new URL(
      buildLeverJobsUrl(createLeverConnectorConfiguration({ site: "acme", pageSize: 25 }), {
        skip: 50,
        request: {
          locations: ["Remote", "New York"],
          teams: ["Engineering"],
          departments: ["Product"],
          commitments: ["Full-time"],
        },
      }),
    );

    expect(url.origin).toBe("https://api.lever.co");
    expect(url.pathname).toBe("/v0/postings/acme");
    expect(url.searchParams.get("mode")).toBe("json");
    expect(url.searchParams.get("skip")).toBe("50");
    expect(url.searchParams.get("limit")).toBe("25");
    expect(url.searchParams.getAll("location")).toEqual(["Remote", "New York"]);
    expect(url.searchParams.getAll("team")).toEqual(["Engineering"]);
    expect(url.searchParams.getAll("department")).toEqual(["Product"]);
    expect(url.searchParams.getAll("commitment")).toEqual(["Full-time"]);
  });
});
