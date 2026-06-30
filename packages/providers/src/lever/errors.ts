export type LeverConnectorErrorKind =
  | "configuration"
  | "network"
  | "timeout"
  | "rate_limited"
  | "temporary_failure"
  | "invalid_response";

export class LeverConnectorError extends Error {
  constructor(
    message: string,
    readonly kind: LeverConnectorErrorKind,
    readonly details: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = "LeverConnectorError";
  }
}
