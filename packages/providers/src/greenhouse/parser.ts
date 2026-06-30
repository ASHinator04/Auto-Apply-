import { GreenhouseConnectorError } from "./errors";
import type { GreenhouseBoardReference, RawGreenhouseJob } from "./models";

export function parseGreenhouseJobsResponse(
  payload: unknown,
  boardToken: string,
): RawGreenhouseJob[] {
  if (!isRecord(payload) || !Array.isArray(payload.jobs)) {
    throw new GreenhouseConnectorError(
      "Greenhouse response must contain a jobs array.",
      "invalid_response",
    );
  }

  return payload.jobs.map((job) => parseGreenhouseJob(job, boardToken));
}

function parseGreenhouseJob(payload: unknown, boardToken: string): RawGreenhouseJob {
  if (!isRecord(payload)) {
    throw new GreenhouseConnectorError("Greenhouse job must be an object.", "invalid_response");
  }

  return {
    id: readNumberOrString(payload.id),
    internalJobId: readNumberOrString(payload.internal_job_id),
    title: readString(payload.title),
    absoluteUrl: readString(payload.absolute_url),
    location: parseReference(payload.location),
    departments: parseReferences(payload.departments),
    offices: parseReferences(payload.offices),
    updatedAt: readString(payload.updated_at),
    requisitionId: readString(payload.requisition_id),
    content: readString(payload.content),
    metadata: payload.metadata,
    providerMetadata: {
      provider: "greenhouse",
      boardToken,
    },
    raw: payload,
  };
}

function parseReferences(value: unknown): GreenhouseBoardReference[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map(parseReference).filter((reference) => reference !== undefined);
}

function parseReference(value: unknown): GreenhouseBoardReference | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  return {
    id: readNumberOrString(value.id),
    name: readString(value.name),
  };
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function readNumberOrString(value: unknown): number | string | undefined {
  return typeof value === "number" || typeof value === "string" ? value : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
