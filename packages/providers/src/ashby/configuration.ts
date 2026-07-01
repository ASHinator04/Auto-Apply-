import { AshbyConnectorError } from "./errors";

export type AshbyLoggingLevel = "silent" | "error" | "info" | "debug";

export interface AshbyRetryConfiguration {
  maxAttempts: number;
  backoffMs: number;
}

export interface AshbyConnectorConfiguration {
  jobBoardName: string;
  baseUrl: string;
  timeoutMs: number;
  userAgent: string;
  retryPolicy: AshbyRetryConfiguration;
  enabled: boolean;
  priority: number;
  loggingLevel: AshbyLoggingLevel;
  includeCompensation: boolean;
}

export type AshbyConnectorConfigurationInput = Partial<
  Omit<AshbyConnectorConfiguration, "jobBoardName" | "retryPolicy">
> & {
  jobBoardName: string;
  retryPolicy?: Partial<AshbyRetryConfiguration>;
};

export const DEFAULT_ASHBY_BASE_URL = "https://api.ashbyhq.com/posting-api/job-board";
export const DEFAULT_ASHBY_USER_AGENT = "JobAgentMVP/0.1";

export function createAshbyConnectorConfiguration(
  input: AshbyConnectorConfigurationInput,
): AshbyConnectorConfiguration {
  const configuration: AshbyConnectorConfiguration = {
    jobBoardName: input.jobBoardName,
    baseUrl: input.baseUrl ?? DEFAULT_ASHBY_BASE_URL,
    timeoutMs: input.timeoutMs ?? 15_000,
    userAgent: input.userAgent ?? DEFAULT_ASHBY_USER_AGENT,
    retryPolicy: {
      maxAttempts: input.retryPolicy?.maxAttempts ?? 3,
      backoffMs: input.retryPolicy?.backoffMs ?? 250,
    },
    enabled: input.enabled ?? true,
    priority: input.priority ?? 1_000,
    loggingLevel: input.loggingLevel ?? "error",
    includeCompensation: input.includeCompensation ?? true,
  };

  validateAshbyConnectorConfiguration(configuration);

  return configuration;
}

function validateAshbyConnectorConfiguration(configuration: AshbyConnectorConfiguration): void {
  if (!configuration.jobBoardName.trim()) {
    throw new AshbyConnectorError("Ashby job board name is required.", "configuration", {
      key: "jobBoardName",
    });
  }

  try {
    new URL(configuration.baseUrl);
  } catch {
    throw new AshbyConnectorError("Ashby base URL must be a valid URL.", "configuration", {
      key: "baseUrl",
    });
  }

  if (!Number.isInteger(configuration.timeoutMs) || configuration.timeoutMs <= 0) {
    throw new AshbyConnectorError("Ashby timeout must be a positive integer.", "configuration", {
      key: "timeoutMs",
    });
  }

  if (!configuration.userAgent.trim()) {
    throw new AshbyConnectorError("Ashby User-Agent is required.", "configuration", {
      key: "userAgent",
    });
  }

  if (
    !Number.isInteger(configuration.retryPolicy.maxAttempts) ||
    configuration.retryPolicy.maxAttempts <= 0
  ) {
    throw new AshbyConnectorError(
      "Ashby retry attempts must be a positive integer.",
      "configuration",
      { key: "retryPolicy.maxAttempts" },
    );
  }

  if (
    !Number.isInteger(configuration.retryPolicy.backoffMs) ||
    configuration.retryPolicy.backoffMs < 0
  ) {
    throw new AshbyConnectorError(
      "Ashby retry backoff must be a non-negative integer.",
      "configuration",
      { key: "retryPolicy.backoffMs" },
    );
  }

  if (!Number.isInteger(configuration.priority) || configuration.priority < 0) {
    throw new AshbyConnectorError(
      "Ashby priority must be a non-negative integer.",
      "configuration",
      {
        key: "priority",
      },
    );
  }
}
