import type { ConfigurationError, ProviderError } from "@job-agent/contracts";

export class SearchConfigurationException extends Error {
  readonly details: ConfigurationError;

  constructor(message: string, key: string) {
    super(message);
    this.name = "SearchConfigurationException";
    this.details = {
      kind: "configuration",
      code: "search_configuration_invalid",
      message,
      key,
    };
  }
}

export function createProviderExecutionError(
  providerId: string,
  message: string,
  code = "search_provider_execution_failed",
): ProviderError {
  return {
    kind: "provider",
    code,
    message,
    providerId,
  };
}
