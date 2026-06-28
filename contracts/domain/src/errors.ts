export type ErrorContext = Record<string, string | number | boolean | null | undefined>;

export interface ContractError {
  code: string;
  message: string;
  context?: ErrorContext;
}

export interface DomainError extends ContractError {
  kind: "domain";
}

export interface ValidationError extends ContractError {
  kind: "validation";
  field?: string;
}

export interface ProviderError extends ContractError {
  kind: "provider";
  providerId?: string;
}

export interface AutomationError extends ContractError {
  kind: "automation";
  providerId?: string;
}

export interface KnowledgeError extends ContractError {
  kind: "knowledge";
  entryId?: string;
}

export interface ConfigurationError extends ContractError {
  kind: "configuration";
  key?: string;
}

export type JobAgentError =
  | DomainError
  | ValidationError
  | ProviderError
  | AutomationError
  | KnowledgeError
  | ConfigurationError;
