import type {
  KnowledgeEntry,
  KnowledgeEntryInput,
  KnowledgeEntryListResponse,
} from "./knowledge-types";
import { recordActivity } from "./activity-log-store";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export async function listKnowledgeEntries(search: string): Promise<KnowledgeEntry[]> {
  const params = new URLSearchParams();
  if (search.trim()) {
    params.set("query", search.trim());
  }
  const suffix = params.size > 0 ? `?${params.toString()}` : "";
  recordActivity({
    area: "api",
    level: "info",
    message: "Requested knowledge entries.",
    detail: search.trim() ? `Search: ${search.trim()}` : "No search filter.",
  });
  const response = await fetch(`${API_BASE_URL}/knowledge${suffix}`);
  const payload = (await parseResponse(response)) as KnowledgeEntryListResponse;
  recordActivity({
    area: "api",
    level: "success",
    message: "Loaded knowledge entries.",
    detail: `${payload.entries.length} entries returned.`,
  });
  return payload.entries;
}

export async function createKnowledgeEntry(input: KnowledgeEntryInput): Promise<KnowledgeEntry> {
  recordActivity({
    area: "api",
    level: "info",
    message: "Creating knowledge entry.",
    detail: input.title.trim() || "Untitled entry",
  });
  const response = await fetch(`${API_BASE_URL}/knowledge`, {
    body: JSON.stringify(toPayload(input)),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
  const payload = (await parseResponse(response)) as KnowledgeEntry;
  recordActivity({
    area: "api",
    level: "success",
    message: "Created knowledge entry.",
    detail: payload.title,
  });
  return payload;
}

export async function updateKnowledgeEntry(
  entryId: string,
  input: KnowledgeEntryInput,
): Promise<KnowledgeEntry> {
  recordActivity({
    area: "api",
    level: "info",
    message: "Updating knowledge entry.",
    detail: input.title.trim() || entryId,
  });
  const response = await fetch(`${API_BASE_URL}/knowledge/${entryId}`, {
    body: JSON.stringify(toPayload(input)),
    headers: { "Content-Type": "application/json" },
    method: "PUT",
  });
  const payload = (await parseResponse(response)) as KnowledgeEntry;
  recordActivity({
    area: "api",
    level: "success",
    message: "Updated knowledge entry.",
    detail: payload.title,
  });
  return payload;
}

export async function deleteKnowledgeEntry(entryId: string): Promise<void> {
  recordActivity({
    area: "api",
    level: "info",
    message: "Deleting knowledge entry.",
    detail: entryId,
  });
  const response = await fetch(`${API_BASE_URL}/knowledge/${entryId}`, {
    method: "DELETE",
  });
  await parseResponse(response);
  recordActivity({
    area: "api",
    level: "success",
    message: "Deleted knowledge entry.",
    detail: entryId,
  });
}

function toPayload(input: KnowledgeEntryInput) {
  return {
    section: input.section,
    entryType: input.entryType,
    title: input.title.trim(),
    content: input.content.trim(),
    companyName: input.companyName?.trim() || null,
    sortOrder: input.sortOrder,
  };
}

async function parseResponse(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return undefined;
  }

  const payload = await parsePayload(response);
  if (!response.ok) {
    const message = errorDetail(payload);
    recordActivity({
      area: "api",
      level: "error",
      message: "Knowledge API request failed.",
      detail: message,
    });
    throw new Error(message);
  }
  return payload;
}

async function parsePayload(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json();
  }
  return response.text();
}

function errorDetail(payload: unknown): string {
  if (typeof payload === "string" && payload.trim()) {
    return payload;
  }

  if (isDetailPayload(payload)) {
    if (typeof payload.detail === "string") {
      return payload.detail;
    }
    if (Array.isArray(payload.detail)) {
      return "The knowledge entry is invalid. Check the fields and try again.";
    }
  }

  return "Knowledge Base request failed.";
}

function isDetailPayload(payload: unknown): payload is { detail: unknown } {
  return typeof payload === "object" && payload !== null && "detail" in payload;
}
