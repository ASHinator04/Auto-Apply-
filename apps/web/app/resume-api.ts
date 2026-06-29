import type { Resume, ResumeListResponse } from "./resume-types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export async function listResumes(): Promise<Resume[]> {
  const response = await fetch(`${API_BASE_URL}/resumes`);
  const payload = (await parseResponse(response)) as ResumeListResponse;
  return payload.resumes;
}

export async function uploadResume(file: File, displayName: string): Promise<Resume> {
  const formData = new FormData();
  formData.append("file", file);
  if (displayName.trim()) {
    formData.append("displayName", displayName.trim());
  }

  const response = await fetch(`${API_BASE_URL}/resumes`, {
    body: formData,
    method: "POST",
  });
  return (await parseResponse(response)) as Resume;
}

export async function renameResume(resumeId: string, displayName: string): Promise<Resume> {
  const response = await fetch(`${API_BASE_URL}/resumes/${resumeId}`, {
    body: JSON.stringify({ displayName: displayName.trim() }),
    headers: { "Content-Type": "application/json" },
    method: "PATCH",
  });
  return (await parseResponse(response)) as Resume;
}

export async function replaceResumeFile(resumeId: string, file: File): Promise<Resume> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/resumes/${resumeId}/file`, {
    body: formData,
    method: "PUT",
  });
  return (await parseResponse(response)) as Resume;
}

export async function setPrimaryResume(resumeId: string): Promise<Resume> {
  const response = await fetch(`${API_BASE_URL}/resumes/${resumeId}/primary`, {
    method: "PUT",
  });
  return (await parseResponse(response)) as Resume;
}

export async function deleteResume(resumeId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/resumes/${resumeId}`, {
    method: "DELETE",
  });
  await parseResponse(response);
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
      return "The resume request was invalid. Check the highlighted fields and try again.";
    }
  }

  return "Resume request failed.";
}

function isDetailPayload(payload: unknown): payload is { detail: unknown } {
  return typeof payload === "object" && payload !== null && "detail" in payload;
}
