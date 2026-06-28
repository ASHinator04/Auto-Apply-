import { FileUp } from "lucide-react";
import React from "react";

export function EmptyResumeState() {
  return (
    <section className="flex min-h-72 flex-col items-center justify-center border border-dashed border-slate-300 bg-white p-8 text-center">
      <FileUp aria-hidden="true" className="h-10 w-10 text-sky-700" />
      <h2 className="mt-4 text-xl font-semibold text-slate-950">Upload your first resume</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
        Add a PDF resume to start managing versions and choose the primary resume for future
        applications.
      </p>
    </section>
  );
}
