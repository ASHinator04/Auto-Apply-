import type { LeverConnectorConfiguration } from "./configuration";
import type { LeverSearchRequest } from "./models";

export interface LeverJobsUrlOptions {
  request?: LeverSearchRequest;
  skip: number;
}

export function buildLeverJobsUrl(
  configuration: LeverConnectorConfiguration,
  options: LeverJobsUrlOptions,
): string {
  const baseUrl = configuration.baseUrl.endsWith("/")
    ? configuration.baseUrl.slice(0, -1)
    : configuration.baseUrl;
  const url = new URL(`${baseUrl}/${encodeURIComponent(configuration.site)}`);
  url.searchParams.set("mode", "json");
  url.searchParams.set("skip", String(options.skip));
  url.searchParams.set("limit", String(configuration.pageSize));

  appendValues(url, "location", options.request?.locations);
  appendValues(url, "team", options.request?.teams);
  appendValues(url, "department", options.request?.departments);
  appendValues(url, "commitment", options.request?.commitments);

  return url.toString();
}

function appendValues(url: URL, key: string, values: readonly string[] | undefined): void {
  if (values === undefined) {
    return;
  }

  for (const value of values) {
    if (value.trim() !== "") {
      url.searchParams.append(key, value);
    }
  }
}
