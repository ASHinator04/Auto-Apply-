import type { GreenhouseConnectorConfiguration } from "./configuration";

export function buildGreenhouseJobsUrl(configuration: GreenhouseConnectorConfiguration): string {
  const baseUrl = configuration.baseUrl.endsWith("/")
    ? configuration.baseUrl.slice(0, -1)
    : configuration.baseUrl;
  const url = new URL(`${baseUrl}/boards/${encodeURIComponent(configuration.boardToken)}/jobs`);
  url.searchParams.set("content", "true");

  return url.toString();
}
