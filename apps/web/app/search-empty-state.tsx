import { Search } from "lucide-react";
import React from "react";

export function SearchEmptyState() {
  return (
    <section className="border border-dashed border-slate-300 bg-white/80 p-6 text-sm text-slate-600">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 text-sky-700">
          <Search aria-hidden="true" className="h-4 w-4" />
        </span>
        <div>
          <h2 className="font-semibold text-slate-900">Start with keywords</h2>
          <p className="mt-1 max-w-2xl leading-6">
            Select a resume, enter search criteria, and run the certified search flow. Results are
            summarized here before the Job Browser appears for returned jobs.
          </p>
        </div>
      </div>
    </section>
  );
}
