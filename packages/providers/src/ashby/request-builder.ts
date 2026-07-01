import type { AshbyConnectorConfiguration } from "./configuration";

export function buildAshbyJobsUrl(configuration: AshbyConnectorConfiguration): string {
  const baseUrl = configuration.baseUrl.endsWith("/")
    ? configuration.baseUrl.slice(0, -1)
    : configuration.baseUrl;
  const url = new URL(`${baseUrl}/${encodeURIComponent(configuration.jobBoardName)}`);
  url.searchParams.set("includeCompensation", String(configuration.includeCompensation));

  return url.toString();
}
