"use client";

import { FileUp, Pencil, RefreshCw, Star, Trash2, Upload } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

import {
  deleteResume,
  listResumes,
  renameResume,
  replaceResumeFile,
  setPrimaryResume,
  uploadResume,
} from "./resume-api";
import { EmptyResumeState } from "./resume-empty-state";
import { formatFileSize, sortResumesNewestFirst, validatePdfFile } from "./resume-utils";
import type { Resume } from "./resume-types";

type DraftNames = Record<string, string>;

export function ResumeDashboard() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [draftNames, setDraftNames] = useState<DraftNames>({});
  const [uploadName, setUploadName] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    void refreshResumes();
  }, []);

  async function refreshResumes() {
    setIsLoading(true);
    try {
      const nextResumes = sortResumesNewestFirst(await listResumes());
      setResumes(nextResumes);
      setDraftNames(
        Object.fromEntries(nextResumes.map((resume) => [resume.id, resume.displayName])),
      );
      setError(null);
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!uploadFile) {
      setError("Choose a PDF resume to upload.");
      return;
    }

    const validationError = validatePdfFile(uploadFile);
    if (validationError) {
      setError(validationError);
      return;
    }

    await runAction(async () => {
      await uploadResume(uploadFile, uploadName);
      setUploadName("");
      setUploadFile(null);
      setNotice("Resume uploaded.");
      form.reset();
    });
  }

  async function handleRename(resume: Resume) {
    const draftName = draftNames[resume.id] ?? resume.displayName;
    const trimmedName = draftName.trim();
    if (!trimmedName) {
      setError("Resume name is required.");
      setNotice(null);
      return;
    }

    await runAction(async () => {
      await renameResume(resume.id, trimmedName);
      setNotice("Resume renamed.");
    });
  }

  async function handleReplace(resume: Resume, file: File) {
    const validationError = validatePdfFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    await runAction(async () => {
      await replaceResumeFile(resume.id, file);
      setNotice("Resume replaced.");
    });
  }

  async function handleSetPrimary(resume: Resume) {
    await runAction(async () => {
      await setPrimaryResume(resume.id);
      setNotice("Primary resume updated.");
    });
  }

  async function handleDelete(resume: Resume) {
    if (resume.isPrimary && resumes.length > 1) {
      setError("Select another primary resume before deleting this one.");
      return;
    }

    const confirmed = window.confirm(`Delete ${resume.displayName}?`);
    if (!confirmed) {
      return;
    }

    await runAction(async () => {
      await deleteResume(resume.id);
      setNotice("Resume deleted.");
    });
  }

  async function runAction(action: () => Promise<void>) {
    setIsBusy(true);
    setError(null);
    setNotice(null);
    try {
      await action();
      await refreshResumes();
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-2 border-b border-slate-200 pb-5">
        <p className="text-sm font-medium uppercase text-sky-700">Phase 1</p>
        <h1 className="text-3xl font-semibold">Resume Management</h1>
        <p className="max-w-3xl text-sm leading-6 text-slate-600">
          Upload PDF resumes, manage names and versions, and choose the primary resume used by
          default in later workflows.
        </p>
      </header>

      <form
        className="grid gap-4 border border-slate-200 bg-white p-5 md:grid-cols-[1fr_1fr_auto]"
        onSubmit={(event) => {
          void handleUpload(event);
        }}
      >
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Resume PDF
          <input
            accept="application/pdf,.pdf"
            className="border border-slate-300 bg-white px-3 py-2 text-sm"
            name="resume"
            onChange={(event) => setUploadFile(event.target.files?.[0] ?? null)}
            type="file"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Display name
          <input
            className="border border-slate-300 px-3 py-2 text-sm"
            maxLength={120}
            onChange={(event) => setUploadName(event.target.value)}
            placeholder="Backend Resume"
            type="text"
            value={uploadName}
          />
        </label>
        <button
          className="inline-flex h-10 items-center justify-center gap-2 self-end bg-sky-700 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
          disabled={isBusy}
          type="submit"
        >
          <Upload aria-hidden="true" className="h-4 w-4" />
          Upload
        </button>
      </form>

      {error ? (
        <p
          aria-live="polite"
          className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      ) : null}
      {notice ? (
        <p
          aria-live="polite"
          className="border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
        >
          {notice}
        </p>
      ) : null}

      {isLoading ? (
        <section className="border border-slate-200 bg-white p-6 text-sm text-slate-600">
          Loading resumes...
        </section>
      ) : resumes.length === 0 ? (
        <EmptyResumeState />
      ) : (
        <section className="overflow-hidden border border-slate-200 bg-white">
          <div className="grid grid-cols-[1fr_auto] gap-4 border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="text-lg font-semibold">Uploaded resumes</h2>
              <p className="text-sm text-slate-600">Newest resumes appear first.</p>
            </div>
            <div className="text-right text-sm text-slate-600">{resumes.length} total</div>
          </div>
          <div className="divide-y divide-slate-200">
            {resumes.map((resume) => (
              <article
                className="grid gap-4 px-5 py-4 lg:grid-cols-[minmax(0,1fr)_auto]"
                key={resume.id}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      aria-label={`Display name for ${resume.displayName}`}
                      className="min-w-0 flex-1 border border-slate-300 px-3 py-2 text-sm font-medium"
                      maxLength={120}
                      onChange={(event) =>
                        setDraftNames((current) => ({
                          ...current,
                          [resume.id]: event.target.value,
                        }))
                      }
                      value={draftNames[resume.id] ?? resume.displayName}
                    />
                    {resume.isPrimary ? (
                      <span className="inline-flex items-center gap-1 bg-sky-100 px-2 py-1 text-xs font-semibold text-sky-800">
                        <Star aria-hidden="true" className="h-3 w-3" />
                        Primary
                      </span>
                    ) : null}
                  </div>
                  <dl className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-4">
                    <div>
                      <dt className="font-medium text-slate-500">File</dt>
                      <dd className="truncate">{resume.originalFilename}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-slate-500">Uploaded</dt>
                      <dd>{new Date(resume.uploadDate).toLocaleDateString()}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-slate-500">Size</dt>
                      <dd>{formatFileSize(resume.size)}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-slate-500">Version</dt>
                      <dd>v{resume.version}</dd>
                    </div>
                  </dl>
                </div>

                <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                  <button
                    className="inline-flex items-center gap-2 border border-slate-300 px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:text-slate-400"
                    disabled={
                      isBusy ||
                      !(draftNames[resume.id] ?? resume.displayName).trim() ||
                      (draftNames[resume.id] ?? resume.displayName).trim() === resume.displayName
                    }
                    onClick={() => {
                      void handleRename(resume);
                    }}
                    type="button"
                  >
                    <Pencil aria-hidden="true" className="h-4 w-4" />
                    Save
                  </button>
                  <label className="inline-flex cursor-pointer items-center gap-2 border border-slate-300 px-3 py-2 text-sm font-medium">
                    <RefreshCw aria-hidden="true" className="h-4 w-4" />
                    Replace
                    <input
                      accept="application/pdf,.pdf"
                      className="sr-only"
                      disabled={isBusy}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) {
                          void handleReplace(resume, file);
                        }
                        event.target.value = "";
                      }}
                      type="file"
                    />
                  </label>
                  <button
                    className="inline-flex items-center gap-2 border border-slate-300 px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:text-slate-400"
                    disabled={isBusy || resume.isPrimary}
                    onClick={() => {
                      void handleSetPrimary(resume);
                    }}
                    type="button"
                  >
                    <Star aria-hidden="true" className="h-4 w-4" />
                    Make primary
                  </button>
                  <button
                    className="inline-flex items-center gap-2 border border-red-200 px-3 py-2 text-sm font-medium text-red-700 disabled:cursor-not-allowed disabled:text-red-300"
                    disabled={isBusy}
                    onClick={() => {
                      void handleDelete(resume);
                    }}
                    type="button"
                  >
                    <Trash2 aria-hidden="true" className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <footer className="flex items-center gap-2 text-xs text-slate-500">
        <FileUp aria-hidden="true" className="h-4 w-4" />
        PDF only. Files are validated, but only resume metadata is stored locally in Phase 1.
      </footer>
    </section>
  );
}

function errorMessage(caught: unknown): string {
  if (caught instanceof Error) {
    return caught.message;
  }
  return "Resume operation failed.";
}
