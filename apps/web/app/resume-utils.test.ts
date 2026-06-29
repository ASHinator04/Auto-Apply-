import { describe, expect, it } from "vitest";

import { formatFileSize, sortResumesNewestFirst, validatePdfFile } from "./resume-utils";
import type { Resume } from "./resume-types";

describe("resume utilities", () => {
  it("formats file sizes for resume metadata", () => {
    expect(formatFileSize(512)).toBe("512 B");
    expect(formatFileSize(1536)).toBe("1.5 KB");
    expect(formatFileSize(2 * 1024 * 1024)).toBe("2.0 MB");
  });

  it("sorts resumes newest first", () => {
    const older = resume("older", "2026-06-28T10:00:00.000Z");
    const newer = resume("newer", "2026-06-29T10:00:00.000Z");

    expect(sortResumesNewestFirst([older, newer]).map((item) => item.id)).toEqual([
      "newer",
      "older",
    ]);
  });

  it("validates pdf extension, MIME type, and size", () => {
    expect(validatePdfFile(new File(["%PDF"], "resume.pdf", { type: "application/pdf" }))).toBe(
      null,
    );
    expect(validatePdfFile(new File(["%PDF"], "resume.txt", { type: "application/pdf" }))).toBe(
      "Only PDF files with a .pdf extension are supported.",
    );
    expect(validatePdfFile(new File(["%PDF"], "resume.pdf", { type: "text/plain" }))).toBe(
      "Only files with the application/pdf MIME type are supported.",
    );
    expect(
      validatePdfFile(
        new File([new Uint8Array(5 * 1024 * 1024 + 1)], "resume.pdf", {
          type: "application/pdf",
        }),
      ),
    ).toBe("PDF files must be 5 MB or smaller.");
  });
});

function resume(id: string, uploadDate: string): Resume {
  return {
    id,
    displayName: id,
    originalFilename: `${id}.pdf`,
    uploadDate,
    size: 1024,
    mimeType: "application/pdf",
    version: 1,
    isPrimary: id === "older",
  };
}
