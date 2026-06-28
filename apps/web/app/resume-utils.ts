import type { Resume } from "./resume-types";

export const MAX_RESUME_SIZE_BYTES = 5 * 1024 * 1024;

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function sortResumesNewestFirst(resumes: Resume[]): Resume[] {
  return [...resumes].sort((left, right) => {
    return new Date(right.uploadDate).getTime() - new Date(left.uploadDate).getTime();
  });
}

export function validatePdfFile(file: File): string | null {
  if (!file.name.toLowerCase().endsWith(".pdf")) {
    return "Only PDF files with a .pdf extension are supported.";
  }
  if (file.type !== "application/pdf") {
    return "Only files with the application/pdf MIME type are supported.";
  }
  if (file.size > MAX_RESUME_SIZE_BYTES) {
    return "PDF files must be 5 MB or smaller.";
  }
  return null;
}
