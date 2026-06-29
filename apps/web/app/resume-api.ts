import type { Resume, ResumeListResponse } from "./resume-types";
import { recordActivity } from "./activity-log-store";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export async function listResumes(): Promise<Resume[]> {
  recordActivity({
    area: "api",
    level: "info",
    message: "Requested resumes.",
  });
  const response = await fetch(`${API_BASE_URL}/resumes`);
  const payload = (await parseResponse(response)) as ResumeListResponse;
  recordActivity({
    area: "api",
    level: "success",
    message: "Loaded resumes.",
    detail: `${payload.resumes.length} resumes returned.`,
  });
  return payload.resumes;
}

export async function uploadResume(file: File, displayName: string): Promise<Resume> {
  const formData = new FormData();
  formData.append("file", file);
  if (displayName.trim()) {
    formData.append("displayName", displayName.trim());
  }

  recordActivity({
    area: "api",
    level: "info",
    message: "Uploading resume.",
    detail: displayName.trim() || file.name,
  });
  const response = await fetch(`${API_BASE_URL}/resumes`, {
    body: formData,
    method: "POST",
  });
  const payload = (await parseResponse(response)) as Resume;
  recordActivity({
    area: "api",
    level: "success",
    message: "Uploaded resume.",
    detail: payload.displayName,
  });
  return payload;
}

export async function renameResume(resumeId: string, displayName: string): Promise<Resume> {
  recordActivity({
    area: "api",
    level: "info",
    message: "Renaming resume.",
    detail: displayName.trim() || resumeId,
  });
  const response = await fetch(`${API_BASE_URL}/resumes/${resumeId}`, {
    body: JSON.stringify({ displayName: displayName.trim() }),
    headers: { "Content-Type": "application/json" },
    method: "PATCH",
  });
  const payload = (await parseResponse(response)) as Resume;
  recordActivity({
    area: "api",
    level: "success",
    message: "Renamed resume.",
    detail: payload.displayName,
  });
  return payload;
}

export async function replaceResumeFile(resumeId: string, file: File): Promise<Resume> {
  const formData = new FormData();
  formData.append("file", file);

  recordActivity({
    area: "api",
    level: "info",
    message: "Replacing resume file.",
    detail: file.name,
  });
  const response = await fetch(`${API_BASE_URL}/resumes/${resumeId}/file`, {
    body: formData,
    method: "PUT",
  });
  const payload = (await parseResponse(response)) as Resume;
  recordActivity({
    area: "api",
    level: "success",
    message: "Replaced resume file.",
    detail: payload.displayName,
  });
  return payload;
}

export async function setPrimaryResume(resumeId: string): Promise<Resume> {
  recordActivity({
    area: "api",
    level: "info",
    message: "Setting primary resume.",
    detail: resumeId,
  });
  const response = await fetch(`${API_BASE_URL}/resumes/${resumeId}/primary`, {
    method: "PUT",
  });
  const payload = (await parseResponse(response)) as Resume;
  recordActivity({
    area: "api",
    level: "success",
    message: "Updated primary resume.",
    detail: payload.displayName,
  });
  return payload;
}

export async function deleteResume(resumeId: string): Promise<void> {
  recordActivity({
    area: "api",
    level: "info",
    message: "Deleting resume.",
    detail: resumeId,
  });
  const response = await fetch(`${API_BASE_URL}/resumes/${resumeId}`, {
    method: "DELETE",
  });
  await parseResponse(response);
  recordActivity({
    area: "api",
    level: "success",
    message: "Deleted resume.",
    detail: resumeId,
  });
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
      message: "Resume API request failed.",
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
      return "The resume request was invalid. Check the highlighted fields and try again.";
    }
  }

  return "Resume request failed.";
}

function isDetailPayload(payload: unknown): payload is { detail: unknown } {
  return typeof payload === "object" && payload !== null && "detail" in payload;
}
