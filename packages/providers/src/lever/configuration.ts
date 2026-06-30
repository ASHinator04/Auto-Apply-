import { LeverConnectorError } from "./errors";

export type LeverLoggingLevel = "silent" | "error" | "info" | "debug";

export interface LeverRetryConfiguration {
  maxAttempts: number;
  backoffMs: number;
}

export interface LeverConnectorConfiguration {
  site: string;
  baseUrl: string;
  timeoutMs: number;
  userAgent: string;
  retryPolicy: LeverRetryConfiguration;
  enabled: boolean;
  priority: number;
  loggingLevel: LeverLoggingLevel;
  maxPages: number;
  pageSize: number;
}

export type LeverConnectorConfigurationInput = Partial<
  Omit<LeverConnectorConfiguration, "site" | "retryPolicy">
> & {
  site: string;
  retryPolicy?: Partial<LeverRetryConfiguration>;
};

export const DEFAULT_LEVER_BASE_URL = "https://api.lever.co/v0/postings";
export const DEFAULT_LEVER_USER_AGENT = "JobAgentMVP/0.1";

export function createLeverConnectorConfiguration(
  input: LeverConnectorConfigurationInput,
): LeverConnectorConfiguration {
  const configuration: LeverConnectorConfiguration = {
    site: input.site,
    baseUrl: input.baseUrl ?? DEFAULT_LEVER_BASE_URL,
    timeoutMs: input.timeoutMs ?? 15_000,
    userAgent: input.userAgent ?? DEFAULT_LEVER_USER_AGENT,
    retryPolicy: {
      maxAttempts: input.retryPolicy?.maxAttempts ?? 3,
      backoffMs: input.retryPolicy?.backoffMs ?? 250,
    },
    enabled: input.enabled ?? true,
    priority: input.priority ?? 1_000,
    loggingLevel: input.loggingLevel ?? "error",
    maxPages: input.maxPages ?? 10,
    pageSize: input.pageSize ?? 100,
  };

  validateLeverConnectorConfiguration(configuration);

  return configuration;
}

function validateLeverConnectorConfiguration(configuration: LeverConnectorConfiguration): void {
  if (!configuration.site.trim()) {
    throw new LeverConnectorError("Lever site is required.", "configuration", { key: "site" });
  }

  try {
    new URL(configuration.baseUrl);
  } catch {
    throw new LeverConnectorError("Lever base URL must be a valid URL.", "configuration", {
      key: "baseUrl",
    });
  }

  if (!Number.isInteger(configuration.timeoutMs) || configuration.timeoutMs <= 0) {
    throw new LeverConnectorError("Lever timeout must be a positive integer.", "configuration", {
      key: "timeoutMs",
    });
  }

  if (!configuration.userAgent.trim()) {
    throw new LeverConnectorError("Lever User-Agent is required.", "configuration", {
      key: "userAgent",
    });
  }

  if (
    !Number.isInteger(configuration.retryPolicy.maxAttempts) ||
    configuration.retryPolicy.maxAttempts <= 0
  ) {
    throw new LeverConnectorError(
      "Lever retry attempts must be a positive integer.",
      "configuration",
      { key: "retryPolicy.maxAttempts" },
    );
  }

  if (
    !Number.isInteger(configuration.retryPolicy.backoffMs) ||
    configuration.retryPolicy.backoffMs < 0
  ) {
    throw new LeverConnectorError(
      "Lever retry backoff must be a non-negative integer.",
      "configuration",
      { key: "retryPolicy.backoffMs" },
    );
  }

  if (!Number.isInteger(configuration.priority) || configuration.priority < 0) {
    throw new LeverConnectorError(
      "Lever priority must be a non-negative integer.",
      "configuration",
      {
        key: "priority",
      },
    );
  }

  if (!Number.isInteger(configuration.maxPages) || configuration.maxPages <= 0) {
    throw new LeverConnectorError("Lever max pages must be a positive integer.", "configuration", {
      key: "maxPages",
    });
  }

  if (!Number.isInteger(configuration.pageSize) || configuration.pageSize <= 0) {
    throw new LeverConnectorError("Lever page size must be a positive integer.", "configuration", {
      key: "pageSize",
    });
  }
}
