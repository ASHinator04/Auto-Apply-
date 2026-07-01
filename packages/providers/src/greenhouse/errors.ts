export type GreenhouseErrorKind =
  | "configuration"
  | "network"
  | "timeout"
  | "rate_limited"
  | "temporary_failure"
  | "invalid_response";

export class GreenhouseConnectorError extends Error {
  constructor(
    message: string,
    readonly kind: GreenhouseErrorKind,
    readonly details: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = "GreenhouseConnectorError";
  }
}
