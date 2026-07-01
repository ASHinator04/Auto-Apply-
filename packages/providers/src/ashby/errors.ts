export type AshbyConnectorErrorKind =
  | "configuration"
  | "network"
  | "timeout"
  | "rate_limited"
  | "temporary_failure"
  | "invalid_response";

export class AshbyConnectorError extends Error {
  constructor(
    message: string,
    readonly kind: AshbyConnectorErrorKind,
    readonly details: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = "AshbyConnectorError";
  }
}
