import { GreenhouseConnectorError } from "./errors";

export type GreenhouseLoggingLevel = "silent" | "error" | "info" | "debug";

export interface GreenhouseRetryConfiguration {
  maxAttempts: number;
  backoffMs: number;
}

export interface GreenhouseConnectorConfiguration {
  boardToken: string;
  baseUrl: string;
  timeoutMs: number;
  userAgent: string;
  retryPolicy: GreenhouseRetryConfiguration;
  enabled: boolean;
  priority: number;
  loggingLevel: GreenhouseLoggingLevel;
  maxPages: number;
}

export type GreenhouseConnectorConfigurationInput = Partial<
  Omit<GreenhouseConnectorConfiguration, "boardToken" | "retryPolicy">
> & {
  boardToken: string;
  retryPolicy?: Partial<GreenhouseRetryConfiguration>;
};

export const DEFAULT_GREENHOUSE_BASE_URL = "https://boards-api.greenhouse.io/v1";
export const DEFAULT_GREENHOUSE_USER_AGENT = "JobAgentMVP/0.1";

export function createGreenhouseConnectorConfiguration(
  input: GreenhouseConnectorConfigurationInput,
): GreenhouseConnectorConfiguration {
  const configuration: GreenhouseConnectorConfiguration = {
    boardToken: input.boardToken,
    baseUrl: input.baseUrl ?? DEFAULT_GREENHOUSE_BASE_URL,
    timeoutMs: input.timeoutMs ?? 15_000,
    userAgent: input.userAgent ?? DEFAULT_GREENHOUSE_USER_AGENT,
    retryPolicy: {
      maxAttempts: input.retryPolicy?.maxAttempts ?? 3,
      backoffMs: input.retryPolicy?.backoffMs ?? 250,
    },
    enabled: input.enabled ?? true,
    priority: input.priority ?? 1_000,
    loggingLevel: input.loggingLevel ?? "error",
    maxPages: input.maxPages ?? 10,
  };

  validateGreenhouseConnectorConfiguration(configuration);

  return configuration;
}

function validateGreenhouseConnectorConfiguration(
  configuration: GreenhouseConnectorConfiguration,
): void {
  if (!configuration.boardToken.trim()) {
    throw new GreenhouseConnectorError("Greenhouse board token is required.", "configuration", {
      key: "boardToken",
    });
  }

  try {
    new URL(configuration.baseUrl);
  } catch {
    throw new GreenhouseConnectorError(
      "Greenhouse base URL must be a valid URL.",
      "configuration",
      {
        key: "baseUrl",
      },
    );
  }

  if (!Number.isInteger(configuration.timeoutMs) || configuration.timeoutMs <= 0) {
    throw new GreenhouseConnectorError(
      "Greenhouse timeout must be a positive integer.",
      "configuration",
      { key: "timeoutMs" },
    );
  }

  if (!configuration.userAgent.trim()) {
    throw new GreenhouseConnectorError("Greenhouse User-Agent is required.", "configuration", {
      key: "userAgent",
    });
  }

  if (
    !Number.isInteger(configuration.retryPolicy.maxAttempts) ||
    configuration.retryPolicy.maxAttempts <= 0
  ) {
    throw new GreenhouseConnectorError(
      "Greenhouse retry attempts must be a positive integer.",
      "configuration",
      { key: "retryPolicy.maxAttempts" },
    );
  }

  if (
    !Number.isInteger(configuration.retryPolicy.backoffMs) ||
    configuration.retryPolicy.backoffMs < 0
  ) {
    throw new GreenhouseConnectorError(
      "Greenhouse retry backoff must be a non-negative integer.",
      "configuration",
      { key: "retryPolicy.backoffMs" },
    );
  }

  if (!Number.isInteger(configuration.priority) || configuration.priority < 0) {
    throw new GreenhouseConnectorError(
      "Greenhouse priority must be a non-negative integer.",
      "configuration",
      { key: "priority" },
    );
  }

  if (!Number.isInteger(configuration.maxPages) || configuration.maxPages <= 0) {
    throw new GreenhouseConnectorError(
      "Greenhouse max pages must be a positive integer.",
      "configuration",
      { key: "maxPages" },
    );
  }
}
