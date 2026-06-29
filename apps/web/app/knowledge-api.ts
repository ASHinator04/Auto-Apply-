import type {
  KnowledgeEntry,
  KnowledgeEntryInput,
  KnowledgeEntryListResponse,
} from "./knowledge-types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export async function listKnowledgeEntries(search: string): Promise<KnowledgeEntry[]> {
  const params = new URLSearchParams();
  if (search.trim()) {
    params.set("query", search.trim());
  }
  const suffix = params.size > 0 ? `?${params.toString()}` : "";
  const response = await fetch(`${API_BASE_URL}/knowledge${suffix}`);
  const payload = (await parseResponse(response)) as KnowledgeEntryListResponse;
  return payload.entries;
}

export async function createKnowledgeEntry(input: KnowledgeEntryInput): Promise<KnowledgeEntry> {
  const response = await fetch(`${API_BASE_URL}/knowledge`, {
    body: JSON.stringify(toPayload(input)),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
  return (await parseResponse(response)) as KnowledgeEntry;
}

export async function updateKnowledgeEntry(
  entryId: string,
  input: KnowledgeEntryInput,
): Promise<KnowledgeEntry> {
  const response = await fetch(`${API_BASE_URL}/knowledge/${entryId}`, {
    body: JSON.stringify(toPayload(input)),
    headers: { "Content-Type": "application/json" },
    method: "PUT",
  });
  return (await parseResponse(response)) as KnowledgeEntry;
}

export async function deleteKnowledgeEntry(entryId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/knowledge/${entryId}`, {
    method: "DELETE",
  });
  await parseResponse(response);
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
    throw new Error(errorDetail(payload));
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
